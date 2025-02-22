const { students } = require("../models/Students");
const { vins, vin_types, roles } = require("../models/vins");

const fetch_students = async (req, res) => {};

const find_student = async (req, res) => {};

const add_student = async (req, res) => {
  const school_id = req.params.id;
  const { firstname, lastname, email, phone, password, username, grade } =
    req.body;

  try {
    const student = new students();
    const vin = new vins();

    student.firstname = firstname;
    student.lastname = lastname;
    student.email = email;
    student.password = password;
    student.username = username;
    student.phone = phone;
    student.grade = grade;

    const saved_student = await student.save();

    if (saved_student) {
      vin.type = vin_types[0];
    }

    return res.status(200).send({
      status: true,
      student_id: saved_student._id,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      errorMessage: "",
    });
  }
};

const update_student_info = async (req, res) => {};

const deactivate_student = async (req, res) => {};

const swap_student_device = async (req, res) => {};

module.exports = {
  fetch_students,
  find_student,
  add_student,
  deactivate_student,
  swap_student_device,
  update_student_info,
};
