import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import '../Styles/Toast.css';

const activeMessages = new Set();

const Toast = ({ message, visible, icon_name }) => (
  <div className={`custom-toast ${!visible ? 'leave' : ''}`}>
    <i className="material-symbols-rounded">{icon_name}</i>
    {message}
  </div>
);

export const showToast = (message, icon_name="check_box") => {
  if (activeMessages.has(message)) return;

  const ToastWrapper = ({ id, message }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      activeMessages.add(message);

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          toast.dismiss(id);
          activeMessages.delete(message);
        }, 400);
      }, 2000);

      return () => {
        clearTimeout(timer);
        activeMessages.delete(message);
      };
    }, [id, message]);

    return <Toast message={message} visible={visible} icon_name={icon_name} />;
  };

  toast.custom((t) => <ToastWrapper id={t.id} message={message} />, {
    position: 'top-center',
  });
};
