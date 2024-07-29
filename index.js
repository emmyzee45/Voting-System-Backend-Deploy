// import { createConnection } from "typeorm";
import "dotenv/config";
import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, IndexFacesCommand, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition"
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import authRouter from "./routers/auth.js";
import pollsRouter from "./routers/polls.js";
import usersRouter from "./routers/users.js";
import User from "./entity/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import mongoose from "mongoose";

const port = process.env.PORT || 8000;

const app = express();
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION });
// ACCESS_TOKEN_SECRET=976a66a5bd23b2050019f380c4decbbefdf8ff91cf502c68a3fe1ced91d7448cc54ce6c847657d53294e40889cef5bd996ec5b0fefc1f56270e06990657eeb6e
// REFRESH_TOKEN_SECRET=5f567afa6406225c4a759daae77e07146eca5df8149353a844fa9ab67fba22780cb4baa5ea508214934531a6f35e67e96f16a0328559111c597856c660f177c2

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRouter);
app.use("/polls", pollsRouter);
app.use("/users", usersRouter);

// const upload = multer({ storage });
const upload = multer({ dest: 'uploads/' });

app.post("/upload", upload.single('file'), async(req, res) => {

  const { name, password, citizenshipNumber, email } = req.body;
  const image = req.file;

  if (!image) {
      return res.status(400).send({ message: 'Image is required' });
  }
  // console.log(image)
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const imageKey = `${Date.now()}_${image.originalname}`;
      const imageStream = fs.createReadStream(image.path);

      // Upload image to S3
      const s3Params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: imageKey,
          Body: imageStream
      };
      await s3Client.send(new PutObjectCommand(s3Params));
      // const imageUrl = dataImg.Location;
        
      const params = {
        CollectionId: process.env.REKOGNITION_COLLECTION_ID,
        Image: {
          S3Object: {
            Bucket: process.env.S3_BUCKET_NAME,
            Name: imageKey
          }
        },
        ExternalImageId: imageKey,
        MaxFaces: 1,
        // QualityFilter: "AUTO",
        // DetectionAttributes: ["DEFAULT"],
      }

      const indexFacesResult = await rekognitionClient.send(new IndexFacesCommand(params));

      if (!indexFacesResult.FaceRecords.length) {
        console.log(indexFacesResult.FaceRecords)
        return res.status(400).json({ error: 'No faces detected in the image' });
      }
      const newUser = new User();

      newUser.admin = false;
      newUser.name = name;
      newUser.email = email;
      // newUser.image_url = imageUrl;
      newUser.faceId = imageKey;
      newUser.password = hashedPassword;
      newUser.citizenshipNumber = citizenshipNumber;
      await newUser.save();

      return res.send(newUser);
    } catch (error) {
        return res.status(500).send(error);
    } finally {
      // Clean up the uploaded image
      fs.unlinkSync(image.path);
    }

});

app.post("/login-face", upload.single("file"), async(req, res) => {
    const image = req.file;
    const { email, password } = req.body;
    let user = null;
    
    if(!email || !image || !password) {
      return res.status(400).json({error: "Email and image are required!"});
    }

    try {
      user = await User.findOne({ email });
      
      if (!user.verified) return res.status(400).send("Not verified");
      
      const match = await bcrypt.compare(req.body.password, user.password);
    
      //exits if password doesn't match
      if (!match) return res.status(400).send("password doesn't match");

      const authImageKey = `${Date.now()}_${user.name}`;
      // const imageStream = Readable.from(file.buffer);
      // const authImageKey = `${Date.now()}_${image.originalname}`;
      const imageStream = fs.createReadStream(image.path);
      
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: authImageKey,
        Body: imageStream,
        ContentType: image.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      // Search for faces in Rekognition
      const searchFacesParams = {
        CollectionId: process.env.REKOGNITION_COLLECTION_ID,
        Image: {
          S3Object: {
            Bucket: process.env.S3_BUCKET_NAME,
            Name: authImageKey,
          },
        },
        FaceMatchThreshold: 90, // Adjust as needed
        MaxFaces: 1,
      };
      const searchFacesResult = await rekognitionClient.send(new SearchFacesByImageCommand(searchFacesParams));

      if (!searchFacesResult.FaceMatches.length) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      const faceMatch = searchFacesResult.FaceMatches[0];
      const xid = faceMatch.Face.ExternalImageId;
      console.log(xid)
      console.log(user.faceId)
      const isAuthenticated = faceMatch.Face.ExternalImageId === user.faceId;
      // if (!isAuthenticated) {
      //   return res.status(401).json({ error: 'Authentication failed' });
      // }
      // if the code reaches here then the user is authenticated
      // hurray :D

      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

      if (!accessTokenSecret || !refreshTokenSecret) {
      
        return res.status(500).send("server error");
      }

      const plainUserObject = {
        id: user.id,
        name: user.name,
        citizenshipNumber: user.citizenshipNumber,
        email: user.email,
        admin: user.admin,
      };
      const accessToken = jwt.sign(plainUserObject, accessTokenSecret, {
        expiresIn: 60,
      });
      const refreshToken = jwt.sign(plainUserObject, refreshTokenSecret, {
        expiresIn: "7d",
      });

      res.cookie("refreshToken", refreshToken, {
        expires: dayjs().add(7, "days").toDate(),
      });

      return res.send({ user, accessToken });
    } catch (error) {
      console.log(error)
      return res.status(404).send(error);
    } finally {
       // Clean up the uploaded image
       fs.unlinkSync(image.path);
    }

});

app.get("/", (req, res) => {
  console.log(req.cookies);
  res.status(404).send("no link matched!");
});

const connect = () => {
  try{
    mongoose.connect(process.env.MONGO_URL);
    console.log("Mongodb started!")
  }catch(err) {
    console.log(err)
  }
};

app.listen(port, () => {
    connect();
    console.log("Listening at port ", port);
})
