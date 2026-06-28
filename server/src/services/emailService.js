import nodemailer from "nodemailer";

const isEmailEnabled = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

export const sendTaskAssignedEmail = async (task) => {
  if (!isEmailEnabled()) {
    const message = `Email skipped: configure SMTP env vars to notify ${task.assignedToEmail}`;
    console.log(message);
    return { status: "skipped", message };
  }

  const appUrl = process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:5173";
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  const info = await getTransporter().sendMail({
    from,
    to: task.assignedToEmail,
    subject: `New task assigned: ${task.title}`,
    text: [
      `Hi ${task.assignedTo},`,
      "",
      `${task.createdBy} assigned you a task in TaskPulse.`,
      "",
      `Task: ${task.title}`,
      `Priority: ${task.priority}`,
      `Project: ${task.project || "Personal"}`,
      `Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}`,
      "",
      task.description || "No description provided.",
      "",
      `Open TaskPulse: ${appUrl}`
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0b2634">
        <h2 style="margin:0 0 12px">New task assigned</h2>
        <p><strong>${task.createdBy}</strong> assigned you a task in TaskPulse.</p>
        <p><strong>Task:</strong> ${task.title}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Project:</strong> ${task.project || "Personal"}</p>
        <p><strong>Due:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</p>
        <p>${task.description || "No description provided."}</p>
        <p><a href="${appUrl}">Open TaskPulse</a></p>
      </div>
    `
  });

  return { status: "sent", messageId: info.messageId };
};
