const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

const { spawn } = require('child_process');

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['email']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/extract-skills', auth, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ msg: 'Text is required for skill extraction.' });
  }

  try {
    const pythonProcess = spawn('python3', [
      './skill_extractor.py',
      text
    ]);

    let extractedSkills = '';
    let scriptError = '';

    pythonProcess.stdout.on('data', (data) => {
      extractedSkills += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      scriptError += data.toString();
      console.error(`Python Script Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        return res.status(500).json({ msg: 'Failed to extract skills. Check server logs.', scriptError });
      }

      try {
        const skills = JSON.parse(extractedSkills);
        res.json(skills);
      } catch (e) {
        console.error('Failed to parse Python script output:', e);
        res.status(500).json({ msg: 'Failed to parse skills from script output.' });
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('bio', 'Bio is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      bio,
      linkedin_url,
      skills,
      public_wallet_address,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;

    if (name) profileFields.name = name;
    if (bio) profileFields.bio = bio;
    if (linkedin_url) profileFields.linkedin_url = linkedin_url;
    if (public_wallet_address) profileFields.public_wallet_address = public_wallet_address;

    if (skills) {
      if (typeof skills === 'string') {
        profileFields.skills = skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
      } else if (Array.isArray(skills)) {
        profileFields.skills = skills.map(skill => String(skill).trim()).filter(skill => skill !== '');
      } else {
        console.warn('Skills provided in unexpected format:', skills);
        profileFields.skills = [];
      }
    } else {
      profileFields.skills = [];
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);

    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

router.put(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('bio', 'Bio is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      bio,
      linkedin_url,
      skills,
      public_wallet_address,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;

    if (name) profileFields.name = name;
    if (bio) profileFields.bio = bio;
    if (linkedin_url) profileFields.linkedin_url = linkedin_url;
    if (public_wallet_address) profileFields.public_wallet_address = public_wallet_address;

    if (skills) {
        if (typeof skills === 'string') {
            profileFields.skills = skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
        } else if (Array.isArray(skills)) {
            profileFields.skills = skills.map(skill => String(skill).trim()).filter(skill => skill !== '');
        } else {
            console.warn('Skills provided in unexpected format:', skills);
            profileFields.skills = [];
        }
    } else {
        profileFields.skills = [];
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);

    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['email']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    await Profile.findOneAndDelete({ user: req.user.id });
    await User.findOneAndDelete({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
