import { Switch } from "@/components/ui/switch";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface NotificationSettingsProps {
  onSave: (time: number) => void;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onSave,
  onClose,
}) => {
  const storedTime = localStorage.getItem("notifyBefore");
  const [timeBefore, setTimeBefore] = useState<number>(storedTime ? parseInt(storedTime) : 10); // Default 10 min
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(!!storedTime);

  useEffect(() => {
    if (Notification.permission === "denied") {
      setNotificationsEnabled(false);
      localStorage.removeItem("notifyBefore");
    }
  }, []);

  const handleSave = () => {
    if (notificationsEnabled) {
      localStorage.setItem("notifyBefore", timeBefore.toString());
      toast.success(`You will be notified ${timeBefore} minutes before the contest.`);
      onSave(timeBefore);
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        localStorage.setItem("notifyBefore", timeBefore.toString());
        setNotificationsEnabled(true);
        toast.success("Browser notifications enabled.");
      } else {
        toast.error("Permission denied! Enable notifications manually in settings.");
      }
    } else {
      // Disable notifications and clear all related data
      localStorage.removeItem("notifyBefore");
      localStorage.removeItem("notifications");
      setNotificationsEnabled(false);
      toast.success("All notifications disabled.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/40 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-background border text-black dark:text-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md transition-all">
        <h2 className="text-xl font-bold mb-4 text-center">Notification Settings</h2>

        {/* Notification Toggle */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Browser Notifications</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Stay updated! Get notified before the contest starts.
            </p>
          </div>
          <Switch
            id="notification"
            checked={notificationsEnabled}
            onCheckedChange={toggleNotifications}
          />
        </div>

        {/* Time Selection (Only show if notifications are enabled) */}
        {notificationsEnabled && (
          <>
            <label className="block mb-2 text-gray-700 dark:text-gray-300">
              Notify me before:
            </label>
            <select
              value={timeBefore}
              onChange={(e) => setTimeBefore(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-muted dark:text-white transition"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-end mt-5 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          {notificationsEnabled && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-muted text-black dark:text-white rounded-lg cursor-pointer transition"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
