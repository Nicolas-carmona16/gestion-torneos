import TeamChangeLog from "../models/teamChangeLogModel.js";

export const getTeamChangeLog = async (req, res) => {
  try {
    const { team, tournament } = req.query;
    const filter = {};
    if (team) filter.team = team;
    if (tournament) filter.tournament = tournament;

    const changelog = await TeamChangeLog.find(filter)
      .populate("team", "name")
      .populate("tournament", "name")
      .populate("responsible", "firstName lastName email role")
      .populate("playerAffected", "fullName idNumber")
      .sort({ createdAt: -1 });

    res.json(changelog);
  } catch (error) {
    console.error("Error fetching team changelog:", error);
    res.status(500).json({ message: "Error fetching team changelog" });
  }
};

// Obtener novedades no leídas por el admin actual
export const getUnreadChanges = async (req, res) => {
  try {
    const adminId = req.user._id;

    const unreadChanges = await TeamChangeLog.find({
      readBy: { $ne: adminId },
    })
      .populate("team", "name")
      .populate("tournament", "name")
      .populate("responsible", "firstName lastName email role")
      .populate("playerAffected", "fullName idNumber")
      .sort({ createdAt: -1 });

    res.json({
      count: unreadChanges.length,
      changes: unreadChanges,
    });
  } catch (error) {
    console.error("Error fetching unread changes:", error);
    res.status(500).json({ message: "Error fetching unread changes" });
  }
};

// Marcar novedad como leída
export const markAsRead = async (req, res) => {
  try {
    const { changeId } = req.params;
    const adminId = req.user._id;

    const change = await TeamChangeLog.findById(changeId);

    if (!change) {
      return res.status(404).json({ message: "Change log not found" });
    }

    // Si ya está leído por este admin, no hacer nada
    if (change.readBy.includes(adminId)) {
      return res.json({ message: "Already marked as read" });
    }

    change.readBy.push(adminId);
    await change.save();

    res.json({ message: "Marked as read", change });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({ message: "Error marking as read" });
  }
};

// Marcar todas las novedades como leídas
export const markAllAsRead = async (req, res) => {
  try {
    const adminId = req.user._id;

    const result = await TeamChangeLog.updateMany(
      { readBy: { $ne: adminId } },
      { $addToSet: { readBy: adminId } }
    );

    res.json({
      message: "All changes marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Error marking all as read" });
  }
};
