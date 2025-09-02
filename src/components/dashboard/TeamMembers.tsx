import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  Loader2,
  Github,
} from "lucide-react";
import { useApiHooks } from "../../services/api";

interface TeamMember {
  id: string;
  name: string;
  github: string;
  email: string;
  contactno: string;
  image?: string;
  Registrationformhackerid?: any; // Registration object
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

interface Registration {
  id: string;
  teamname: string;
  email: string;
}

export default function TeamMembers() {
  const { useTeamMembers, useRegistrations } = useApiHooks();
  const teamMembersApi = useTeamMembers();
  const registrationsApi = useRegistrations();

  const { data: members = [], isLoading, error } = teamMembersApi.getAll;
  const { data: registrations = [] } = registrationsApi.getAll;
  const createMember = teamMembersApi.create;
  const updateMember = teamMembersApi.update;
  const deleteMember = teamMembersApi.delete;

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      deleteMember.mutate(id);
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
        Error loading team members: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
        <button
          onClick={handleAddMember}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member: TeamMember) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{member.name}</h4>
                  {member.Registrationformhackerid && (
                    <p className="text-sm text-blue-600">
                      Team: {member.Registrationformhackerid.teamname || "N/A"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditMember(member)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="text-red-600 hover:text-red-800"
                  disabled={deleteMember.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {member.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {member.contactno}
              </div>
              {member.github && (
                <div className="flex items-center text-sm text-gray-600">
                  <Github className="w-4 h-4 mr-2" />
                  <a
                    href={
                      member.github.startsWith("http")
                        ? member.github
                        : `https://github.com/${member.github}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {member.github}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {members.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No team members yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first team member.
          </p>
          <button
            onClick={handleAddMember}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Member
          </button>
        </div>
      )}

      {showForm && (
        <MemberForm
          member={editingMember}
          registrations={registrations}
          onClose={() => setShowForm(false)}
          onSave={(memberData) => {
            if (editingMember) {
              updateMember.mutate(
                { id: editingMember.id, data: memberData },
                {
                  onSuccess: () => setShowForm(false),
                  onError: (error) => {
                    console.error("Update error:", error);
                    alert("Failed to update team member. Please try again.");
                  },
                }
              );
            } else {
              createMember.mutate(memberData, {
                onSuccess: () => setShowForm(false),
                onError: (error) => {
                  console.error("Create error:", error);
                  alert("Failed to create team member. Please try again.");
                },
              });
            }
          }}
          isLoading={createMember.isPending || updateMember.isPending}
        />
      )}
    </div>
  );
}

interface MemberFormProps {
  member: TeamMember | null;
  registrations: Registration[];
  onClose: () => void;
  onSave: (member: FormData) => void;
  isLoading: boolean;
}

function MemberForm({
  member,
  registrations,
  onClose,
  onSave,
  isLoading,
}: MemberFormProps) {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    github: member?.github || "",
    email: member?.email || "",
    contactno: member?.contactno || "",
    registrationId: member?.Registrationformhackerid?.id || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(member?.image || "");

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
    formDataToSend.append("name", formData.name);
    formDataToSend.append("github", formData.github);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("contactno", formData.contactno);

    // Add registration object
    if (formData.registrationId) {
      const selectedRegistration = registrations.find(
        (r) => r.id === formData.registrationId
      );
      if (selectedRegistration) {
        formDataToSend.append(
          "Registrationformhackerid",
          JSON.stringify(selectedRegistration)
        );
      }
    }

    if (selectedFile) {
      formDataToSend.append("image", selectedFile);
    }

    onSave(formDataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {member ? "Edit Team Member" : "Add New Team Member"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number *
            </label>
            <input
              type="tel"
              value={formData.contactno}
              onChange={(e) =>
                setFormData({ ...formData, contactno: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Profile *
            </label>
            <input
              type="text"
              value={formData.github}
              onChange={(e) =>
                setFormData({ ...formData, github: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="username or https://github.com/username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Associated Team *
            </label>
            <select
              value={formData.registrationId}
              onChange={(e) =>
                setFormData({ ...formData, registrationId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a registered team</option>
              {registrations.map((registration: Registration) => (
                <option key={registration.id} value={registration.id}>
                  {registration.teamname} ({registration.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required={!member} // Required for new members, optional for editing
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover border border-gray-200 rounded-full"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Upload member profile picture
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
