const prisma = require("../config/prisma");

const UserModel = {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id: String(id) },
    });
  },
};

module.exports = UserModel;
