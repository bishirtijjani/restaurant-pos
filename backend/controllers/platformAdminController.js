const Organization = require("../models/Organization");
const User = require("../models/User");
const Store = require("../models/Store");

// Fetch all organizations with their owner details and basic stats
const getAllOrganizations = async (req, res) => {
  try {
    const orgsWithStats = await Organization.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "ownerDetails"
        }
      },
      {
        $unwind: {
          path: "$ownerDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "stores",
          localField: "_id",
          foreignField: "organizationId",
          as: "stores"
        }
      },
      {
        $addFields: {
          storeCount: { $size: "$stores" },
          ownerId: {
            _id: "$ownerDetails._id",
            fullname: "$ownerDetails.fullname",
            email: "$ownerDetails.email"
          }
        }
      },
      {
        $project: {
          stores: 0,
          ownerDetails: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json({ success: true, data: orgsWithStats });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Toggle status (active/suspended)
const updateOrganizationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended", "trial"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("ownerId", "fullname email");

    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    res.status(200).json({ success: true, data: org });
  } catch (error) {
    console.error("Error updating organization status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update plan (free, basic, pro)
const updateOrganizationPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["free", "basic", "pro"].includes(plan)) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { plan },
      { new: true }
    ).populate("ownerId", "fullname email");

    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    res.status(200).json({ success: true, data: org });
  } catch (error) {
    console.error("Error updating organization plan:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getAllOrganizations,
  updateOrganizationStatus,
  updateOrganizationPlan
};


