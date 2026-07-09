import { useState } from 'react';
import { Calendar } from 'lucide-react';

export const NewDonationModal = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const handleCancel = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setAmount('');
    setDate('');
    setReason('');
    //might hsve to change this logic
  };

  const handleAdd = () => {
    // TODO: wire up add logic
  };

  const labelClass =
    "justify-start text-neutral-700 text-xl font-semibold font-['Source_Sans_Pro']";
  const inputClass =
    "w-full bg-transparent border-none outline-none text-neutral-500 text-xl font-normal font-['Source_Sans_Pro'] placeholder:text-neutral-500";
  const boxClass =
    'absolute px-5 pt-2 pb-3 bg-white rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-500 inline-flex justify-start items-center';

  return (
    <div className="w-[636px] h-[868px] relative bg-white rounded-2xl overflow-hidden">
      {/* Title */}
      <div className="left-[61px] top-[37px] absolute justify-start text-black text-3xl font-bold font-['Source_Sans_Pro']">
        New Donation
      </div>

      {/* First Name Label */}
      <div className={`left-[61px] top-[106px] absolute ${labelClass}`}>
        First Name
      </div>

      {/* First Name Input */}
      <div className={`w-60 h-12 left-[61px] top-[150px] ${boxClass}`}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter First Name"
          className={inputClass}
        />
      </div>

      {/* Last Name Label */}
      <div className={`left-[337px] top-[106px] absolute ${labelClass}`}>
        Last Name
      </div>

      {/* Last Name Input */}
      <div className={`w-60 h-12 left-[337px] top-[150px] ${boxClass}`}>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter Last Name"
          className={inputClass}
        />
      </div>

      {/* Email Label */}
      <div className={`w-52 left-[61px] top-[222px] absolute ${labelClass}`}>
        Email
      </div>

      {/* Email Input */}
      <div className={`w-[514px] h-12 left-[61px] top-[266px] ${boxClass}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Email Address"
          className={inputClass}
        />
      </div>

      {/* Amount Label */}
      <div
        className={`w-52 h-6 left-[61px] top-[338px] absolute ${labelClass}`}
      >
        Amount
      </div>

      {/* Amount Input */}
      <div className={`w-[514px] h-14 left-[61px] top-[375px] ${boxClass}`}>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter Amount"
          className={inputClass}
        />
      </div>

      {/* Date Label */}
      <div
        className={`w-52 h-6 left-[61px] top-[452px] absolute ${labelClass}`}
      >
        Date
      </div>

      {/* Date Input */}
      <div
        className={`w-[514px] h-14 left-[61px] top-[489px] ${boxClass} justify-between`}
      >
        <div className="relative flex-1 h-full flex items-center">
          <span className="text-neutral-500 text-xl font-normal font-['Source_Sans_Pro'] pointer-events-none">
            {date ? date : 'MM/DD/YYYY'}
          </span>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="MM/DD/YYYY"
            maxLength={10}
            className="absolute inset-0 w-full bg-transparent border-none outline-none text-neutral-500 text-xl font-normal font-['Source_Sans_Pro'] placeholder:text-neutral-500"
          />
        </div>
        <Calendar
          className="shrink-0 text-neutral-500"
          style={{ width: '22px', height: '22px' }}
        />
      </div>

      {/* Reason Label */}
      <div className={`w-52 left-[61px] top-[566px] absolute ${labelClass}`}>
        Reason
      </div>

      {/* Reason Textarea */}
      <div className="w-[514px] h-40 px-5 pt-3 left-[61px] top-[607px] absolute bg-white rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-500">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter Donation Reason"
          className="w-full h-full bg-transparent border-none outline-none resize-none text-neutral-500 text-xl font-normal font-['Source_Sans_Pro'] placeholder:text-neutral-500"
        />
      </div>

      {/* Cancel Button */}
      <button
        onClick={handleCancel}
        className="w-24 h-9 px-4 py-1 left-[375px] top-[789px] absolute bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
      >
        <span className="text-center text-black text-base font-normal font-['Source_Sans_Pro'] leading-6">
          Cancel
        </span>
      </button>

      {/* Add Button */}
      <button
        onClick={handleAdd}
        className="w-24 h-9 px-4 py-1 left-[486px] top-[789px] absolute bg-emerald-700 rounded-lg inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-emerald-800 active:bg-emerald-900 transition-colors"
      >
        <span className="text-center text-white text-base font-normal font-['Source_Sans_Pro'] leading-6">
          Add
        </span>
      </button>
    </div>
  );
};
