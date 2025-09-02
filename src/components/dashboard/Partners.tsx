import { useState } from "react";
import { Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import { useApiHooks } from "../../services/api";

interface Partner {
  id: string;
  title: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export default function Partners() {
  const { usePartners } = useApiHooks();
  const partnersApi = usePartners();

  const { data: partners = [], isLoading, error } = partnersApi.getAll;
  const createPartner = partnersApi.create;
  const updatePartner = partnersApi.update;
  const deletePartner = partnersApi.delete;

  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const handleAddPartner = () => {
    setEditingPartner(null);
    setShowForm(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleDeletePartner = (id: string) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      deletePartner.mutate(id);
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
        Error loading partners: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Supporting Partners
        </h3>
        <button
          onClick={handleAddPartner}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner: Partner) => (
          <div key={partner.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-end items-start mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditPartner(partner)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePartner(partner.id)}
                  className="text-red-600 hover:text-red-800"
                  disabled={deletePartner.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="w-32 h-20 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center overflow-hidden">
                {partner.image ? (
                  <img
                    src={partner.image}
                    alt={partner.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {partner.title}
              </h4>
              <p className="text-sm text-gray-500">
                Added: {new Date(partner.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {partners.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No partners yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first supporting partner.
          </p>
          <button
            onClick={handleAddPartner}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Partner
          </button>
        </div>
      )}

      {showForm && (
        <PartnerForm
          partner={editingPartner}
          onClose={() => setShowForm(false)}
          onSave={(partnerData) => {
            if (editingPartner) {
              updatePartner.mutate(
                { id: editingPartner.id, data: partnerData },
                {
                  onSuccess: () => setShowForm(false),
                  onError: (error) => {
                    console.error("Update error:", error);
                    alert("Failed to update partner. Please try again.");
                  },
                }
              );
            } else {
              createPartner.mutate(partnerData, {
                onSuccess: () => setShowForm(false),
                onError: (error) => {
                  console.error("Create error:", error);
                  alert("Failed to create partner. Please try again.");
                },
              });
            }
          }}
          isLoading={createPartner.isPending || updatePartner.isPending}
        />
      )}
    </div>
  );
}

interface PartnerFormProps {
  partner: Partner | null;
  onClose: () => void;
  onSave: (partner: FormData) => void;
  isLoading: boolean;
}

function PartnerForm({
  partner,
  onClose,
  onSave,
  isLoading,
}: PartnerFormProps) {
  const [formData, setFormData] = useState({
    title: partner?.title || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(partner?.image || "");

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

    if (selectedFile) {
      formDataToSend.append("image", selectedFile);
    }

    onSave(formDataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {partner ? "Edit Partner" : "Add New Partner"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter partner name or organization"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner Logo *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required={!partner} // Required for new partners, optional for editing
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-24 h-16 object-contain border border-gray-200 rounded"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Upload partner logo (PNG, JPG, GIF)
            </p>
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
