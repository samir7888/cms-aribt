import { useState } from "react";
import { Eye, Download, Search, Loader2, Plus, FileText } from "lucide-react";
import { useApiHooks } from "../../services/api";

interface Registration {
  id: string;
  teamname: string;
  email: string;
  contactno: string;
  payment?: string; // URL to payment file
  verified: "yes" | "no";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export default function Registration() {
  const { useRegistrations } = useApiHooks();
  const registrationsApi = useRegistrations();

  const {
    data: registrations = [],
    isLoading,
    error,
  } = registrationsApi.getAll;
  const createRegistration = registrationsApi.create;
  const deleteRegistration = registrationsApi.delete;
  const updateStatus = registrationsApi.updateStatus;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredRegistrations = registrations.filter((reg: Registration) => {
    const matchesSearch =
      reg.teamname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.contactno.includes(searchTerm);
    return matchesSearch;
  });

  const handleAddRegistration = () => {
    setShowForm(true);
  };

  const handleDeleteRegistration = (id: string) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      deleteRegistration.mutate(id);
    }
  };

  const exportData = () => {
    const csvContent = [
      ["Team Name", "Email", "Contact No", "Registration Date"],
      ...registrations.map((reg: Registration) => [
        reg.teamname,
        reg.email,
        reg.contactno,
        new Date(reg.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hackathon_registrations.csv";
    a.click();
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
        Error loading registrations: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Registration Management
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleAddRegistration}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Registration
          </button>
          <button
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by team name, email, or contact number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-medium text-gray-600">
            Total Registrations
          </h4>
          <p className="text-2xl font-bold text-gray-800">
            {registrations.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-medium text-gray-600">This Month</h4>
          <p className="text-2xl font-bold text-blue-600">
            {
              registrations.filter((r: Registration) => {
                const regDate = new Date(r.createdAt);
                const now = new Date();
                return (
                  regDate.getMonth() === now.getMonth() &&
                  regDate.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-medium text-gray-600">Today</h4>
          <p className="text-2xl font-bold text-green-600">
            {
              registrations.filter((r: Registration) => {
                const regDate = new Date(r.createdAt);
                const today = new Date();
                return regDate.toDateString() === today.toDateString();
              }).length
            }
          </p>
        </div>
      </div>
      {/* Registrations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRegistrations.map((registration: Registration) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registration.teamname}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {registration.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.contactno}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {registration.payment ? (
                      <a
                        href={registration.payment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        View Payment
                      </a>
                    ) : (
                      <span className="text-gray-400">No payment</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        updateStatus.mutate({
                          id: registration.id,
                          status:
                            registration.verified === "yes" ? "no" : "yes",
                        })
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        registration.verified === "yes"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending
                        ? "Verifying..."
                        : registration.verified === "yes"
                        ? "Verified"
                        : "Unverified"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(registration.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedRegistration(registration)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteRegistration(registration.id)
                        }
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteRegistration.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {registrations.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No registrations yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding the first registration.
          </p>
          <button
            onClick={handleAddRegistration}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Registration
          </button>
        </div>
      )}

      {/* Registration Form Modal */}
      {showForm && (
        <RegistrationForm
          onClose={() => setShowForm(false)}
          onSave={(registrationData) => {
            createRegistration.mutate(registrationData, {
              onSuccess: () => setShowForm(false),
              onError: (error) => {
                console.error("Create error:", error);
                alert("Failed to create registration. Please try again.");
              },
            });
          }}
          isLoading={createRegistration.isPending}
        />
      )}

      {/* Registration Detail Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Registration Details</h3>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Team Name
                  </label>
                  <p className="text-gray-800">
                    {selectedRegistration.teamname}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="text-gray-800">{selectedRegistration.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <p className="text-gray-800">
                    {selectedRegistration.contactno}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Date
                  </label>
                  <p className="text-gray-800">
                    {new Date(selectedRegistration.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedRegistration.payment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Proof
                  </label>
                  <a
                    href={selectedRegistration.payment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="w-4 h-4" />
                    View Payment Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RegistrationFormProps {
  onClose: () => void;
  onSave: (registration: FormData) => void;
  isLoading: boolean;
}

function RegistrationForm({
  onClose,
  onSave,
  isLoading,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    teamname: "",
    email: "",
    contactno: "",
    password: "",
  });
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("teamname", formData.teamname);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("contactno", formData.contactno);
    formDataToSend.append("password", formData.password);

    if (paymentFile) {
      formDataToSend.append("payment", paymentFile);
    }

    onSave(formDataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add New Registration</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              value={formData.teamname}
              onChange={(e) =>
                setFormData({ ...formData, teamname: e.target.value })
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
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Proof *
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload payment receipt (Image or PDF)
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
