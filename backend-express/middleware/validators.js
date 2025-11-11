import { body, validationResult } from 'express-validator';

export const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const registerRules = [
  body('name').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];

export const loginRules = [
  body('email').isEmail(),
  body('password').isString(),
];

export const postRules = [
  body('title').isString().isLength({ min: 3 }),
  body('price').isFloat({ gt: 0 }),
];
