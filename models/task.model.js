const { Schema, Types, models, model } = require("mongoose");
const { ObjectId } = Types;
const mongoErrorPlugin = require("./plugin/mongoErrorPlugin");
const { taskStatus, TASK_STATUS } = require("../enums");
const moment = require("moment");

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      min: [3, "title must be at least 3 characters long"],
    },
    description: {
      type: String,
      required: [true, "Last name is required"],
      min: [3, "description must be at least 3 characters long"],
    },
    createdBy: {
      type: ObjectId,
      ref: "User",
      required: [true, "Created By Is Required"],
    },
    client: {
      type: ObjectId,
      ref: "User",
      required: [true, "Client is Required"],
    },
    analyst: {
      type: ObjectId,
      ref: "User",
      required: [true, "Client is Required"],
    },
    expieryDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
    },
    rejectedBy: {
      type: [ObjectId],
    },
    notRespondedBy: {
      type: [ObjectId],
    },
    status: {
      type: String,
      enum: taskStatus,
      default: TASK_STATUS.PENDING,
    },
    organization: {
      type: ObjectId,
      ref: "organization",
      required: [true, "Task's organization is required"],
    },
    deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.plugin(mongoErrorPlugin);

taskSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.updatedAt;
    delete returnedObject.deleted;
    delete returnedObject.password;
  },
});

const Task = models.Task || model("Task", taskSchema);

module.exports = Task;
