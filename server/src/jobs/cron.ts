import cron from 'node-cron';
import { Lead } from '../models/Lead.model';
import * as notificationService from '../services/notification.service';

export const startCronJobs = (): void => {
  cron.schedule('0 9 * * *', async () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const staleLeads = await Lead.find({
      deletedAt: null,
      status: { $in: ['New', 'Contacted'] },
      updatedAt: { $lt: weekAgo },
    }).limit(50);

    for (const lead of staleLeads) {
      await notificationService.createNotification({
        userId: lead.assignedTo?.toString() || lead.createdBy.toString(),
        organizationId: lead.organizationId.toString(),
        title: 'Stale lead reminder',
        message: `${lead.name} has had no updates for 7+ days`,
        type: 'system',
        link: `/leads/${lead._id}`,
      });
    }
    console.log(`Cron: processed ${staleLeads.length} stale lead reminders`);
  });
};
