// Lightweight request validation middleware

const validateRegister = (req, res, next) => {
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    return res.status(400).json({ message: 'First name is required.' });
  }
  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    return res.status(400).json({ message: 'Last name is required.' });
  }
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ message: 'Username is required.' });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  next();
};

const validateCreateEvent = (req, res, next) => {
  const { title, description, category } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Event title is required.' });
  }
  if (!description || typeof description !== 'object') {
    return res.status(400).json({ message: 'Description details are required.' });
  }
  if (!description.short || typeof description.short !== 'string' || !description.short.trim()) {
    return res.status(400).json({ message: 'Short description is required.' });
  }
  if (description.short.length > 150) {
    return res.status(400).json({ message: 'Short description must be under 150 characters.' });
  }
  if (
    !description.detailed ||
    typeof description.detailed !== 'string' ||
    !description.detailed.trim()
  ) {
    return res.status(400).json({ message: 'Detailed description is required.' });
  }
  if (!category || typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({ message: 'Category is required.' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCreateEvent,
};
