// // client/src/pages/Direct.jsx
// import React, { useEffect, useState } from 'react';
// import { connectSocket } from '../lib/socket';
// import { getToken } from '../lib/authToken';
// import OnlineList from '../components/OnlineList';

// export default function Direct() {
//   const [selected, setSelected] = useState(null);

//   useEffect(() => {
//     connectSocket();   
//   }, []);

//   return (
//     <div className="container mx-auto p-4">
//       <div className="grid grid-cols-3 gap-4">
//         <div className="col-span-1 border rounded-lg">
//           <div className="p-3 font-semibold border-b">Available users</div>
//           <OnlineList onSelectUser={setSelected} />
//         </div>
//         <div className="col-span-2 border rounded-lg p-4">
//           {selected ? (
//             <div>
//               <div className="font-semibold mb-2">
//                 Selected user: {selected.name || selected.userId}
//               </div>
//               <div className="text-gray-500">
//                 (Chat window will appear here in the next step.)
//               </div>
//             </div>
//           ) : (
//             <div className="text-gray-500">Select a user to start chatting…</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import OnlineList from '../components/OnlineList';
import ChatWindow from '../components/ChatWindow';

export default function Direct() {
  const [selected, setSelected] = useState(null);
  const meId = JSON.parse(atob((localStorage.getItem('token') || '').split('.')[1] || 'e30='))?.id;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 border rounded-lg">
          <div className="p-3 font-semibold border-b">Available users</div>
          <OnlineList onSelectUser={setSelected} />
        </div>
        <div className="col-span-2 border rounded-lg p-4">
          <ChatWindow meId={meId} toUser={selected} />
        </div>
      </div>
    </div>
  );
}
