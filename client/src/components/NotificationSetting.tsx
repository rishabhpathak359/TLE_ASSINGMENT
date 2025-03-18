import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface NotificationSettingsProps {
  onSave: (time: number) => void;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onSave, onClose }) => {
  const [timeBefore, setTimeBefore] = useState<number>(10); // Default 10 min

  const handleSave = () => {
    localStorage.setItem("notifyBefore", timeBefore.toString());
    toast.success(`You will be notified ${timeBefore} minutes before the contest.`);
    onSave(timeBefore);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
        <label className="block mb-2">Notify me before:</label>
        <select
          value={timeBefore}
          onChange={(e) => setTimeBefore(parseInt(e.target.value))}
          className="border p-2 rounded w-full"
        >
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
        </select>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
