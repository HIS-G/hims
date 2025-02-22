const { roles } = require("../models/Roles");

const get_roles = async (req, res) => {
  try {
    const available_roles = await roles.find();

    return res.status(200).send({
      status: true,
      message: `List of available roles`,
      roles: available_roles,
    });
  } catch (error) {
    console.log(error);
  }
};

const create_role = async (req, res) => {
  console.log(req.body);
  const { role, permission, active } = req.body;

  try {
    const new_role = new roles();

    new_role.role = role;

    if (permission) {
      new_role.permission = permission;
    }

    if (active) {
      new_role.active = active;
    }

    const saved_role = await new_role.save();

    return res.status(200).send({
      status: true,
      message: `Role created successfully!`,
      role_id: saved_role._id,
    });
  } catch (error) {
    console.log(error);
  }
};

const update_role = async (req, res) => {
  try {
    const role = await roles.findById(req.role_id);

    if (!role) {
      return res.status().send({});
    }

    role.active = !role.active;

    const update = await role.save();

    return res.status(200).send({
      status: 200,
      message: `${
        update.active
          ? "Role has been activated successfully!"
          : "Role has been deactivated successfully!"
      }`,
      role: update._id,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  get_roles,
  create_role,
  update_role,
};
