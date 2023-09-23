const mongoose = require('mongoose')
const { Schema } = mongoose

const SiteSchema = new mongoose.Schema(
  {
    name: String,
    group: { type: Schema.Types.ObjectId, ref: 'Group' },
    webhook: String,
  },
  { timestamps: true }
)
const Site = mongoose.model('Site', SiteSchema)
module.exports = Site