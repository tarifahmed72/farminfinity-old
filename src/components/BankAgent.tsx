import { FaUserTie } from 'react-icons/fa';

const BankAgent = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 p-4 rounded-full">
            <FaUserTie className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Agents Available</h2>
        <p className="text-gray-600">There are currently no bank agents registered in the system. New agents will appear here once they are added.</p>
      </div>
    </div>
  )
}

export default BankAgent