import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch, FiX } from "react-icons/fi";
import { getPublicUsersAction } from "../../redux/actions/userActions";

const getUserName = (user) => {
  return (
    user?.fullname ||
    user?.name ||
    user?.username ||
    user?.email ||
    "SocialEcho user"
  );
};

const getUserAvatar = (user) => {
  return user?.avatar || user?.profilePicture || "";
};

const matchesSearch = (user, searchValue) => {
  const searchableText = [
    user?.fullname,
    user?.name,
    user?.username,
    user?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(searchValue);
};

const NewConversationModal = ({
  show,
  currentUserId,
  onClose,
  onCreateConversation,
}) => {
  const dispatch = useDispatch();
  const searchInputRef = useRef(null);
  const publicUsers = useSelector((state) => state.user?.publicUsers || []);

  const [searchText, setSearchText] = useState("");
  const [creatingUserId, setCreatingUserId] = useState(null);
  const [error, setError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!show || publicUsers.length > 0) {
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        await dispatch(getPublicUsersAction());
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [dispatch, publicUsers.length, show]);

  const resetModal = () => {
    setSearchText("");
    setCreatingUserId(null);
    setError("");
    setLoadingUsers(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const filteredUsers = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    return publicUsers.filter((user) => {
      if (!user?._id || user._id === currentUserId) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return matchesSearch(user, searchValue);
    });
  }, [currentUserId, publicUsers, searchText]);

  const handleCreateConversation = async (recipientId) => {
    if (creatingUserId) {
      return;
    }

    try {
      setError("");
      setCreatingUserId(recipientId);
      await onCreateConversation(recipientId);
      resetModal();
      onClose();
    } catch (error) {
      setError(error.message || "Unable to start conversation.");
      setCreatingUserId(null);
    }
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={searchInputRef}
        onClose={handleClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-md bg-white text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <Dialog.Title
                    as="h2"
                    className="text-lg font-semibold text-gray-900"
                  >
                    New message
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={Boolean(creatingUserId)}
                    className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Close new message modal"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="border-b px-5 py-3">
                  <div className="flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-2">
                    <FiSearch className="shrink-0 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      type="text"
                      placeholder="Search people"
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="border-b bg-red-50 px-5 py-2 text-sm text-red-600">
                    {error}
                  </div>
                ) : null}

                <div className="max-h-80 overflow-y-auto py-2">
                  {loadingUsers ? (
                    <div className="px-5 py-8 text-center text-sm text-gray-500">
                      Loading people...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-gray-500">
                      No users found.
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const userName = getUserName(user);
                      const userAvatar = getUserAvatar(user);
                      const secondaryText = user.username || user.email || "";
                      const isCreating = creatingUserId === user._id;

                      return (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleCreateConversation(user._id)}
                          disabled={Boolean(creatingUserId)}
                          className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {userAvatar ? (
                            <img
                              src={userAvatar}
                              alt={userName}
                              className="h-11 w-11 rounded-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-base font-semibold text-white">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-gray-800">
                              {userName}
                            </p>
                            {secondaryText ? (
                              <p className="truncate text-sm text-gray-500">
                                {secondaryText}
                              </p>
                            ) : null}
                          </div>
                          {isCreating ? (
                            <span className="text-sm font-medium text-primary">
                              Starting...
                            </span>
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex justify-end border-t px-5 py-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={Boolean(creatingUserId)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NewConversationModal;
