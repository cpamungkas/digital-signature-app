const rateLimitStore = new Map();

const cleanExpiredEntries = () => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

const rateLimit = (type = 'general') => {
  const limits = {
    general:  { windowMs: 15 * 60 * 1000, max: 100 },
    auth:     { windowMs: 15 * 60 * 1000, max: 20  },
    register: { windowMs: 60 * 60 * 1000,  max: 5   },
    documents:{ windowMs: 15 * 60 * 1000, max: 50  },
    signatures:{windowMs: 15 * 60 * 1000, max: 30  },
  };

  const config = limits[type] || limits.general;

  return (req, res, next) => {
    const key = `${req.ip}:${type}`;
    const now = Date.now();

    cleanExpiredEntries();

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + config.windowMs };
      rateLimitStore.set(key, entry);
    }

    entry.count += 1;

    res.setHeader('X-RateLimit-Limit', config.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > config.max) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
    }

    next();
  };
};

module.exports = { rateLimit };
