import { ReminderRepository } from "./reminder.repository";
import type { CreateReminderInput, UpdateReminderInput } from "./reminder.schema";

export class ReminderService {
  static async getUserReminders(userId: string) {
    return await ReminderRepository.findByUserId(userId);
  }

  static async getTransactionReminders(transactionId: string, userId: string) {
    return await ReminderRepository.findByTransactionId(transactionId, userId);
  }

  static async getReminderById(reminderId: string, userId: string) {
    return await ReminderRepository.findById(reminderId, userId);
  }

  static async createReminder(input: CreateReminderInput, userId: string) {
    return await ReminderRepository.create(input, userId);
  }

  static async updateReminder(reminderId: string, input: UpdateReminderInput, userId: string) {
    return await ReminderRepository.update(reminderId, input, userId);
  }

  static async deleteReminder(reminderId: string, userId: string) {
    return await ReminderRepository.delete(reminderId, userId);
  }

  static async getPendingReminders(userId: string) {
    return await ReminderRepository.findPendingReminders(userId);
  }

  static async markReminderAsSent(reminderId: string, userId: string) {
    return await ReminderRepository.markAsSent(reminderId, userId);
  }
}
