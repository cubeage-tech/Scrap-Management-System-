import React, { useState } from "react";
import { Building2, Mail, Phone, MapPin, ShieldCheck, FileCheck, User } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState({
    companyName: "Verma Recycling Pvt. Ltd.",
    businessType: "BUYER",
    gstNumber: "27AAACV9842Q1Z3",
    contactName: "Vikram Verma",
    email: "vikram@vermarecycling.com",
    phoneNumber: "+91 98765 43210",
    address: "Plot 42, Industrial Area Phase II",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411026",
    accountState: "ACTIVE",
    categoryInterests: ["Steel", "Copper", "Aluminium", "Plastic"]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-200">
              VR
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.companyName}</h1>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <span>Verified Scrap Buyer</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Account Approved
                </span>
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
            {profile.businessType}
          </span>
        </div>

        {/* Profile Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company & GST Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              Company Details
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-500">Company Name</span>
                <p className="font-semibold text-gray-800">{profile.companyName}</p>
              </div>

              <div>
                <span className="text-xs text-gray-500">GST Number</span>
                <p className="font-mono font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  {profile.gstNumber}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-500">Buyer Categories of Interest</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {profile.categoryInterests.map((cat) => (
                    <span key={cat} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-blue-600" />
              Primary Contact Person
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-500">Contact Name</span>
                <p className="font-semibold text-gray-800">{profile.contactName}</p>
              </div>

              <div>
                <span className="text-xs text-gray-500">Email Address</span>
                <p className="font-medium text-gray-800 flex items-center gap-2 mt-0.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {profile.email}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-500">Phone Number</span>
                <p className="font-medium text-gray-800 flex items-center gap-2 mt-0.5">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {profile.phoneNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            Registered Business Address
          </h2>

          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">{profile.address}</p>
            <p>{profile.city}, {profile.state} - {profile.pincode}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
