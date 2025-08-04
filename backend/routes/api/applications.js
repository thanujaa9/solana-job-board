const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Application = require('../../models/Application');
const Job = require('../../models/Job');

router.post(
  '/',
  [
    auth,
    [
      check('jobId', 'Job ID is required').not().isEmpty().isMongoId(),
      check('coverLetter', 'Cover Letter is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, coverLetter, resume } = req.body;
    const userId = req.user.id;

    try {
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ msg: 'Job not found' });
      }

      const existingApplication = await Application.findOne({
        job: jobId,
        user: userId,
      });

      if (existingApplication) {
        return res.status(400).json({ msg: 'You have already applied for this job' });
      }

      const newApplication = new Application({
        job: jobId,
        user: userId,
        coverLetter: coverLetter,
        resume: resume,
      });

      const application = await newApplication.save();

      job.applications.unshift(application._id);
      await job.save();

      res.status(201).json({ msg: 'Application submitted successfully', application: application });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

router.get('/job/:job_id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.job_id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to view applications for this job' });
    }

    const applications = await Application.find({ job: req.params.job_id })
      .populate('user', ['name', 'email']);

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.put('/:application_id/status', auth, async (req, res) => {
  const { status } = req.body;
  const { application_id } = req.params;

  const validStatuses = ['Pending', 'Reviewed', 'Interviewing', 'Hired', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status provided.' });
  }

  try {
    let application = await Application.findById(application_id).populate('job');
    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    if (application.job.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to update this application.' });
    }

    application.status = status;
    await application.save();

    res.json({ msg: 'Application status updated successfully', application });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid application ID.' });
    }
    res.status(500).send('Server Error');
  }
});

router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('job', 'title company_name location job_type salary description')
      .sort({ applicationDate: -1 });

    if (applications.length === 0) {
      return res.status(200).json([]);
    }

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/test', (req, res) => {
  res.send('Applications API route is working!');
});

module.exports = router;
