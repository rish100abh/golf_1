import express from 'express';
import app from '../../app.js';  // Adjust path

const appHandler = express();

appHandler.all('*', (req, res) => {
  return app(req, res);
});

export default appHandler;
export { config } from '../../vercel.json';