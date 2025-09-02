import { useState } from "react";
import { Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import { useApiHooks } from "../../services/api";

interface Sponsor {
  id: string;
  title: string;
  image?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export default function Sponsors() {
  const { useSponsors } = useApiHooks();
  const sponsorsApi = useSponsors();

  const { data: sponsors = [], isLoading, error } = sponsorsApi.getAll;
  const createSponsor = sponsorsApi.create;
  const updateSponsor = sponsorsApi.update;
  const deleteSponsor = sponsorsApi.delete;

  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  const handleAddSponsor = () => {
    setEditingSponsor(null);
    setShowForm(true);
  };

  const handleEditSponsor = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setShowForm(true);
  };

  const handleDeleteSponsor = (id: string) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      deleteSponsor.mutate(id);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "platinum":
        return "bg-gray-200 text-gray-800";
      case "gold":
        return "bg-yellow-200 text-yellow-800";
      case "silver":
        return "bg-gray-100 text-gray-700";
      case "bronze":
        return "bg-orange-200 text-orange-800";
      case "title":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
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
        Error loading sponsors: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Manage Sponsors</h3>
        <button
          onClick={handleAddSponsor}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Sponsor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((sponsor: Sponsor) => (
          <div key={sponsor.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              {sponsor.type && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    sponsor.type
                  )}`}
                >
                  {sponsor.type.toUpperCase() || "SPONSOR"}
                </span>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSponsor(sponsor)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSponsor(sponsor.id)}
                  className="text-red-600 hover:text-red-800"
                  disabled={deleteSponsor.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="w-32 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center overflow-hidden">
                {sponsor.image ? (
                  <img
                    src={sponsor.image}
                    alt={sponsor.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h4 className="font-semibold text-gray-800">{sponsor.title}</h4>
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(sponsor.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {sponsors.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No sponsors yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first sponsor.
          </p>
          <button
            onClick={handleAddSponsor}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Sponsor
          </button>
        </div>
      )}

      {showForm && (
        <SponsorForm
          sponsor={editingSponsor}
          onClose={() => setShowForm(false)}
          onSave={(sponsorData) => {
            if (editingSponsor) {
              updateSponsor.mutate(
                { id: editingSponsor.id, data: sponsorData },
                {
                  onSuccess: () => setShowForm(false),
                  onError: (error) => {
                    console.error("Update error:", error);
                    alert("Failed to update sponsor. Please try again.");
                  },
                }
              );
            } else {
              createSponsor.mutate(sponsorData, {
                onSuccess: () => setShowForm(false),
                onError: (error) => {
                  console.error("Create error:", error);
                  alert("Failed to create sponsor. Please try again.");
                },
              });
            }
          }}
          isLoading={createSponsor.isPending || updateSponsor.isPending}
        />
      )}
    </div>
  );
}

interface SponsorFormProps {
  sponsor: Sponsor | null;
  onClose: () => void;
  onSave: (sponsor: FormData) => void;
  isLoading: boolean;
}

function SponsorForm({
  sponsor,
  onClose,
  onSave,
  isLoading,
}: SponsorFormProps) {
  const [formData, setFormData] = useState({
    title: sponsor?.title || "",
    type: sponsor?.type || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(sponsor?.image || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("type", formData.type);

    if (selectedFile) {
      formDataToSend.append("image", selectedFile);
    }

    onSave(formDataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {sponsor ? "Edit Sponsor" : "Add New Sponsor"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sponsor Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Type</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="title">Title Sponsor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sponsor Logo *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required={!sponsor} // Required for new sponsors, optional for editing
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-20 h-12 object-contain border border-gray-200 rounded"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
