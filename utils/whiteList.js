//add servers consuming API here
const whiteList = [
    'http://localhost:3500',
    'http://localhost:3000',
    'https://techstudio-site.vercel.app/',
    'https://techstudio-site-techstudioconsults.vercel.app/',
    process.env.BASE_URL
];

module.exports = whiteList;