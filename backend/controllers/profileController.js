const Profile = require('../models/Profile');
const User = require('../models/User');

exports.getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['email']);
        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createOrUpdateProfile = async (req, res) => {
    const { name, bio, linkedin_url, skills, public_wallet_address } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;

    if (name) profileFields.name = name;
    if (bio) profileFields.bio = bio;
    if (linkedin_url) profileFields.linkedin_url = linkedin_url;
    if (public_wallet_address) profileFields.public_wallet_address = public_wallet_address;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
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
        res.status(500).send('Server Error');
    }
};
