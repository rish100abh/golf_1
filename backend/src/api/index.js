// backend/api/index.js - Vercel serverless entry
import express from 'express';
import app from '../../app.js';

export default async function handler(req, res) {
  await new Promise((resolve) => {
    app(req, res, resolve);
  });
}