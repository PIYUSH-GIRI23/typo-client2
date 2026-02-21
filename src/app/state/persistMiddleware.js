export const persistMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);
  const state = store.getState();

  if (typeof window !== "undefined") {
    if (prevState.modal !== state.modal) {
      const { commandModalOpen, ...modalStateToPersist } = state.modal;
      localStorage.setItem("modalSlice", JSON.stringify(modalStateToPersist));
    }

    if (prevState.colorscheme !== state.colorscheme) {
      localStorage.setItem(
        "colorschemeSlice", JSON.stringify(state.colorscheme));
    }

    if (prevState.userdata !== state.userdata) {
      localStorage.setItem(
        "userdataSlice", JSON.stringify(state.userdata));
    }
  }

  return result;
};


export const loadPersistedState = () => {
  if (typeof window === "undefined") return {};

  const safeParse = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : undefined;
    } catch {
      return undefined;
    }
  };

  return {
    modal: safeParse("modalSlice"),
    colorscheme: safeParse("colorschemeSlice"),
    userdata: safeParse("userdataSlice"),
  };
};
