const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Job = require('../../models/Job');
const User = require('../../models/User');
const mongoose = require('mongoose');
const Profile = require('../../models/Profile');
const Application = require('../../models/Application');

router.get('/match/:job_id/:user_id', auth, async (req, res) => {
  const { job_id, user_id } = req.params;

  try {
    const job = await Job.findById(job_id);
    const applicantProfile = await Profile.findOne({ user: user_id });

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    if (!applicantProfile) {
      return res.status(404).json({ msg: 'Applicant profile not found' });
    }

    const jobSkills = new Set(job.skills.map(skill => skill.toLowerCase()));
    const applicantSkills = new Set(applicantProfile.skills.map(skill => skill.toLowerCase()));

    if (jobSkills.size === 0) {
      return res.status(200).json({ score: 0 });
    }

    let matchingSkillsCount = 0;
    for (const skill of applicantSkills) {
      if (jobSkills.has(skill)) {
        matchingSkillsCount++;
      }
    }

    const matchScore = (matchingSkillsCount / jobSkills.size) * 100;

    res.json({ score: matchScore.toFixed(2) });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Job or User ID' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.put('/application/:application_id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.application_id);

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Application not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('skills', 'Skills are required').not().isEmpty(),
      check('paymentTxId', 'Payment transaction ID is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      skills,
      budget,
      salary,
      location,
      job_type,
      company_name,
      company_website,
      tags,
      paymentTxId,
      paymentStatus
    } = req.body;

    try {
      const user = await User.findById(req.user.id).select('-password');

      const skillsArray = Array.isArray(skills) ? skills.map(skill => skill.trim()) : [];
      const tagsArray = Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(t => t !== '') : [];

      const newJob = new Job({
        user: req.user.id,
        title,
        description,
        skills: skillsArray,
        budget: budget || undefined,
        salary: salary ? { min: salary.min, max: salary.max } : undefined,
        location: location || undefined,
        job_type: job_type || undefined,
        company_name: company_name || undefined,
        company_website: company_website || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        paymentTxId,
        paymentStatus
      });

      const job = await newJob.save();
      res.json(job);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error', error: err.message });
    }
  }
);

router.get('/', async (req, res) => {
    try {
        const { search, location, jobType, skills, minSalary, maxSalary, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { company_name: { $regex: search, $options: 'i' } }
            ];
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (jobType) {
            query.job_type = jobType;
        }
        if (skills) {
            const skillArray = skills.split(',').map(s => s.trim());
            query.skills = { $in: skillArray.map(s => new RegExp(s, 'i')) };
        }
        if (minSalary || maxSalary) {
            query.salary = {};
            if (minSalary) {
                query.salary.min = { $gte: parseFloat(minSalary) };
            }
            if (maxSalary) {
                query.salary.max = { $lte: parseFloat(maxSalary) };
            }
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const jobs = await Job.find(query)
                                .sort({ applicationDate: -1 })
                                .skip(skip)
                                .limit(limitNum);

        const totalJobs = await Job.countDocuments(query);

        res.json({
            jobs,
            currentPage: pageNum,
            totalPages: Math.ceil(totalJobs / limitNum),
            totalJobs
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get("/my-posted-jobs", auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
        console.error('JOBS ROUTE: MongoDB NOT CONNECTED!');
        return res.status(500).json({ message: "Backend database not connected." });
    }

    const jobs = await Job.find({ user: req.user.id })
      .populate({
        path: 'applications',
        model: 'Application',
        populate: {
          path: 'user',
          model: 'User',
          select: 'name email',
        }
      })
      .sort({ date: -1 });

    const jobDetails = jobs.map(job => {
      const applicants = job.applications.map(app => ({
        _id: app._id,
        user: app.user ? { id: app.user._id, name: app.user.name, email: app.user.email } : null,
        status: app.status,
        coverLetter: app.coverLetter,
        resume: app.resume,
        applicationDate: app.applicationDate,
      }));

      return {
        _id: job._id,
        title: job.title,
        description: job.description,
        skills: job.skills,
        location: job.location,
        job_type: job.job_type,
        salary: job.salary,
        budget: job.budget,
        company_name: job.company_name,
        company_website: job.company_website,
        tags: job.tags,
        date: job.date,
        applicants: applicants,
      };
    });
    res.status(200).json({ jobs: jobDetails });

  } catch (err) {
    console.error("JOBS ROUTE: Error fetching posted jobs:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// REMOVED 'auth' middleware to make this a public endpoint
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'applications',
        model: 'Application',
        populate: {
          path: 'user',
          model: 'User',
          select: 'name email',
        }
      });
      
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    const applicants = job.applications.map(app => ({
      _id: app._id,
      user: app.user ? { id: app.user._id, name: app.user.name, email: app.user.email } : null,
      status: app.status,
      coverLetter: app.coverLetter,
      resume: app.resume,
      applicationDate: app.applicationDate,
    }));

    const jobDetails = {
      _id: job._id,
      user: job.user,
      title: job.title,
      description: job.description,
      skills: job.skills,
      location: job.location,
      job_type: job.job_type,
      salary: job.salary,
      budget: job.budget,
      company_name: job.company_name,
      company_website: job.company_website,
      tags: job.tags,
      date: job.date,
      applicants: applicants,
    };

    res.json({ job: jobDetails });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await job.deleteOne();
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;