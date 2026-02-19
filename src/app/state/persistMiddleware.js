export const persistMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  if (typeof window !== 'undefined') {
    const state = store.getState();

    if (state.modal) {
      localStorage.setItem('modalSlice', JSON.stringify(state.modal));
    }

    if (state.colorscheme) {
      localStorage.setItem('colorschemeSlice', JSON.stringify(state.colorscheme));
    }

    if (state.userdata) {
      localStorage.setItem('userdataSlice', JSON.stringify(state.userdata));
    }
  }

  return result;
};

export const loadPersistedState = () => {
  if (typeof window === 'undefined') {
    return {
      modal: null,
      colorscheme: null,
      userdata: null,
    };
  }

  return {
    modal: localStorage.getItem('modalSlice')
      ? JSON.parse(localStorage.getItem('modalSlice'))
      : null,
    colorscheme: localStorage.getItem('colorschemeSlice')
      ? JSON.parse(localStorage.getItem('colorschemeSlice'))
      : null,
    userdata: localStorage.getItem('userdataSlice')
      ? JSON.parse(localStorage.getItem('userdataSlice'))
      : null,
  };
};
