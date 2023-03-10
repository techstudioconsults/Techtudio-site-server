//modules
const path = require("path");
const fs = require("fs");

//library
const { Storage } = require("@google-cloud/storage");

//Define consts
const googleCloud = new Storage({
  keyFilename: path.join(__dirname, "../resource_secret.json"),
  projectId: process.env.PROJECT_ID,
});

//Get bucket from google cloud
const bucket = googleCloud.bucket("techstudio");

const uploadResources = async function ({ resources, title }) {
  const publicUrls = await Promise.all(
    resources.map(async (resource) => {
      //path to data
      const localFilePath = path.join(
        __dirname,
        `../uploads/${resource.originalname}`
      );

      // Create a read stream for the local file
      const readStream = fs.createReadStream(localFilePath);

      // Define the destination path for the file in the bucket (including the file name)
      const destinationPath =
        resource.fieldname == "audio"
          ? `${title}/audio/${resource.originalname}`
          : resource.fieldname == "video"
          ? `${title}/video/${resource.originalname}`
          : `${title}/pdf/${resource.originalname}`;

      //create writestream to write data into bucket
      const writeStream = bucket.file(destinationPath).createWriteStream();

      //retrieve public urls from gc
      const urlPromise = new Promise((resolve, reject) => {
        readStream
          .pipe(writeStream)
          .on("error", reject)
          .on("finish", () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
            fs.promises.unlink(localFilePath);
            resolve(publicUrl);
          });
      });

      //retrive file names
      const namePromise = new Promise((resolve, reject) => {
        resolve(resource.originalname);
      });

      //return object promised
      return Promise.all([urlPromise, namePromise]).then(([url, name]) => ({
        name,
        url,
      }));
    })
  );

  return publicUrls;
};

module.exports = { uploadResources };
