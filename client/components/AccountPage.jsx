import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, Edit2, Save, X, ArrowLeft } from 'lucide-react';

const AccountPage = () => {
  // Simulated user data lang ni, kamo na bahala mag fetch from DB HSHS
  const [userData, setUserData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    registeredDate: '2023-08-15',
    rewardPoints: 1250
  });

  const [isEditing, setIsEditing] = useState({
    fullName: false
  });

  const [editedData, setEditedData] = useState({
    fullName: userData.fullName
  });

  const [daysSinceRegistered, setDaysSinceRegistered] = useState(0);

  // Days since registration
  useEffect(() => {
    const registrationDate = new Date(userData.registeredDate);
    const today = new Date();
    const timeDifference = today.getTime() - registrationDate.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    setDaysSinceRegistered(daysDifference);
  }, [userData.registeredDate]);

  const handleEdit = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSave = (field) => {
    setUserData(prev => ({
      ...prev,
      [field]: editedData[field]
    }));
    setIsEditing(prev => ({
      ...prev,
      [field]: false
    }));
    
    
    //Update back end here to reflect the change (UPDATE or smthn)
    console.log(`Saving ${field}:`, editedData[field]);
  };

  const handleCancel = (field) => {
    setEditedData(prev => ({
      ...prev,
      [field]: userData[field]
    }));
    setIsEditing(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  

  const handleBackToHome = () => {
    //Link to home page here
    alert('Navigation to home page would happen here');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start mb-8">
          <button 
            onClick={handleBackToHome}
            className="inline-flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-200"
          >
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 mr-2">
              <ArrowLeft className="w-4 h-4" />
            </span>
            Back to Home
          </button>
        </div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
   <span className="w-18 h-18 flex items-center justify-center rounded-full bg-orange-100">
    <User className="w-10 h-10 text-orange-600" />
  </span>
</div>
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and information</p>
        </div>

        {/* Main Account Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-3 text-gray-500" />
                Profile Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing.fullName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave('fullName')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel('fullName')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-900">{userData.fullName}</span>
                    <button
                      onClick={() => handleEdit('fullName')}
                      className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="flex items-center py-2">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">{userData.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-3 text-gray-500" />
              Account Statistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Registration Date */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Member Since</div>
                <div className="font-semibold text-gray-900">
                  {new Date(userData.registeredDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">{daysSinceRegistered} days ago</div>
              </div>

              {/* Reward Points */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                <Award className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">Reward Points</div>
                <div className="text-2xl font-bold text-orange-600">
                  {userData.rewardPoints.toLocaleString()}
                </div>
                <div className="text-xs text-orange-700 mt-1">Keep earning more!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Buttons */}
        <div className="mt-6 space-y-3">
        
          <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 px-4 rounded-xl transition-colors duration-200">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;