import { useState, useEffect } from "react";
import { Save, Loader2, FileText } from "lucide-react";
import { useApiHooks } from "../../services/api";

interface HackathonInfo {
  id?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function About() {
  const { useHackathonInfo } = useApiHooks();
  const hackathonApi = useHackathonInfo();

  const { data: hackathonData, isLoading, error } = hackathonApi.get;
  const updateHackathon = hackathonApi.update;

  const [hackathonInfo, setHackathonInfo] = useState<HackathonInfo>({
    description:
      "Join us for an exciting 48-hour hackathon where innovation meets technology. Build amazing solutions, network with like-minded developers, and compete for exciting prizes.\n\nEvent Details:\n• Date: March 15-17, 2025\n• Location: ARIBT Campus, Technology Center\n• Duration: 48 hours\n• Registration: Open now\n\nPrizes:\n• First Prize: $5000\n• Second Prize: $3000\n• Third Prize: $1500\n• Best Innovation Award: $1000\n\nRules & Guidelines:\n1. Teams can have 2-4 members\n2. All code must be written during the event\n3. Use of external APIs is allowed\n4. Projects must be submitted by the deadline\n5. All team members must be present during judging\n\nThemes:\n• AI & Machine Learning\n• Web Development\n• Mobile Apps\n• IoT Solutions\n• Blockchain Technology\n• Healthcare Tech",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");

  // Update local state when data is loaded from API
  useEffect(() => {
    if (hackathonData && hackathonData.length > 0) {
      const data = hackathonData[0];
      setHackathonInfo(data);
      setEditDescription(data.description);
    } else if (hackathonData && hackathonData.description) {
      // Handle single object response
      setHackathonInfo(hackathonData);
      setEditDescription(hackathonData.description);
    }
  }, [hackathonData]);

  const handleEdit = () => {
    setEditDescription(hackathonInfo.description);
    setIsEditing(true);
  };

  const handleSave = () => {
    const requestData = { description: editDescription };

    if (hackathonInfo.id) {
      // Update existing
      updateHackathon.mutate(
        { id: hackathonInfo.id, data: requestData },
        {
          onSuccess: () => {
            setHackathonInfo({
              ...hackathonInfo,
              description: editDescription,
            });
            setIsEditing(false);
          },
          onError: (error) => {
            console.error("Update error:", error);
            alert("Failed to update hackathon information. Please try again.");
          },
        }
      );
    } else {
      // Create new (if API supports POST)
      // For now, we'll assume it's always an update
      alert(
        "No existing hackathon information found. Please contact administrator."
      );
    }
  };

  const handleCancel = () => {
    setEditDescription(hackathonInfo.description);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error loading hackathon information: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">About Hackathon</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Edit Information
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={updateHackathon.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              disabled={updateHackathon.isPending || !editDescription.trim()}
            >
              {updateHackathon.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hackathon Description *
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter detailed information about the hackathon including event details, prizes, rules, themes, etc."
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              You can use line breaks to format the content. Include all
              relevant information about the hackathon.
            </p>
          </div>
        ) : (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Hackathon Information
            </h4>
            <div className="prose max-w-none">
              <pre className="text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {hackathonInfo.description}
              </pre>
            </div>
            {hackathonInfo.updatedAt && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated:{" "}
                  {new Date(hackathonInfo.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {!hackathonInfo.description && !isLoading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hackathon information yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding information about your hackathon.
          </p>
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Information
          </button>
        </div>
      )}
    </div>
  );
}
