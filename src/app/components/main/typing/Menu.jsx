"use client"

import {useSelector,useDispatch}  from 'react-redux'
import { fetchParagraphAction } from "@/app/actions/redisAction";
import colorSchemeOptions from "@/app/state/colorSchemeOptions"
import CustomTime from "@/app/components/main/typing/custom/CustomTime"
import CustomPara from "@/app/components/main/typing/custom/CustomPara"
import paraToLines from '@/app/utils/paraToLines'
import editParaLines from '@/app/utils/editParaLines'
import generateKey from "@/app/utils/generateKey";
import {useState,useCallback, useEffect, useMemo, useRef, useSyncExternalStore} from 'react';
import { RiResetRightFill, RiRefreshLine } from "react-icons/ri";
import { BiCustomize } from "react-icons/bi";
import { IoChevronDown } from "react-icons/io5";
import {
  startAndResetTyping, 
  setTypingStartTime, 
  setTypingParaLines,
  updateParaLines, 
  toggleFullstop,
  togglePunctuation, 
  toggleNumbers, 
  toggleSymbols,
  changeType,
  changeDifficulty,
  changeLength
} from '@/app/state/slices/typingdataSlice';

const Menu = ({ isHidden = false }) => {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const id = useSelector(state => state.colorscheme.id);
  const {type, selectedTime, fullstop, punctuation, numbers, symbols, length, difficulty, paraLines, originalPara} = useSelector(state => state.typingdata);
  const dispatch = useDispatch();
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [showCustomPara, setShowCustomPara] = useState(false);
  const hasInitialized = useRef(false);

  const activeTheme = useMemo(
    () => colorSchemeOptions.find((option) => option.id === id) ?? colorSchemeOptions[0],
    [id]
  );

  const optionStyle = (active) =>
    `px-2 py-1 rounded-md cursor-pointer transition text-xs sm:text-sm
    ${active ? "text-yellow-500" : "text-gray-400"}
    hover:text-yellow-400`;

  const getTypingBoxMetrics = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const element = document.getElementById('typing-box');
    if (!element) return null;

    const style = window.getComputedStyle(element);
    const width = element.clientWidth;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const letterSpacing = parseFloat(style.letterSpacing) || 0;
    const wordSpacing = parseFloat(style.wordSpacing) || 0;
    const usableWidth = width - paddingLeft - paddingRight;

    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    return {
      usableWidth,
      font,
      letterSpacing,
      wordSpacing
    };
  }, []);

  const convertParaToLines = useCallback((para) => {
    const metrics = getTypingBoxMetrics();
    if (!metrics || !metrics.usableWidth) return null;

    return paraToLines(
      para,
      metrics.usableWidth,
      metrics.font,
      metrics.letterSpacing,
      metrics.wordSpacing
    );
  }, [getTypingBoxMetrics]);

  const getParagraph = useCallback(async (nextConfig = {}) => {
      const nextType = nextConfig.type ?? type;
      const nextLength = nextConfig.length ?? length;
      const nextDifficulty = nextConfig.difficulty ?? difficulty;

      try {
          const key = await generateKey(nextType, nextLength, nextDifficulty);
          const res = await fetchParagraphAction({ key });

          if (!res?.success) return null;

          const data = JSON.parse(res.data);
          return data.content;
      }
      catch(err){
        return null;
      }
    },[type,length,difficulty])

    const setTypingParaLinesHandler = useCallback(async (nextConfig = {}) => {
      const para = await getParagraph(nextConfig);
      if (!para) return;

      const nextParaLines = convertParaToLines(para);
      if (!nextParaLines) return;

      dispatch(setTypingParaLines({
        para,
        paraLines: nextParaLines
      }));
    }, [dispatch, getParagraph, convertParaToLines]);

    const startAndResetTypingHandler = useCallback(async (nextConfig = {}) => {
      const para = await getParagraph(nextConfig);
      if (!para) return;

      const nextParaLines = convertParaToLines(para);
      if (!nextParaLines) return;

      dispatch(startAndResetTyping({
        para,
        paraLines: nextParaLines
      }));
    }, [dispatch, getParagraph, convertParaToLines]);

    const changeTypeHandler = useCallback(async (e) => {
        const nextType = e.target.value;
        dispatch(changeType({type: nextType}));
        await setTypingParaLinesHandler({ type: nextType });
    },[dispatch, setTypingParaLinesHandler])
    const changeDifficultyHandler = useCallback(async (e) => {
        const nextDifficulty = e.target.value;
        dispatch(changeDifficulty({difficulty: nextDifficulty}));
        await setTypingParaLinesHandler({ difficulty: nextDifficulty });
    },[dispatch, setTypingParaLinesHandler])
     const changeLengthHandler = useCallback(async (e) => {
        const nextLength = e.target.value;
        dispatch(changeLength({length: nextLength}));
        await setTypingParaLinesHandler({ length: nextLength });
    },[dispatch, setTypingParaLinesHandler])
    const toggleFullstopHandler = useCallback(() => {
      dispatch(toggleFullstop());
    },[dispatch])
    const togglePunctuationHandler = useCallback(() => {
        dispatch(togglePunctuation());
    },[dispatch])
    const toggleNumbersHandler = useCallback(() => {
        dispatch(toggleNumbers());
    },[dispatch])
    const toggleSymbolsHandler = useCallback(() => {
        dispatch(toggleSymbols());
    },[dispatch])

    const updateParaLinesHandler = useCallback(() => {
        const baseEditedLines = editParaLines(type, paraLines, fullstop, punctuation, numbers, symbols);

        if (type === 'para' && (fullstop || punctuation || numbers || symbols)) {
          const editedPara = baseEditedLines.join(' ');
          const reflowedEditedLines = convertParaToLines(editedPara);

          dispatch(updateParaLines({
            editedParaLines: reflowedEditedLines ?? baseEditedLines
          }));
          return;
        }

        dispatch(updateParaLines({
          editedParaLines: baseEditedLines
        }));
    }, [dispatch, type, paraLines, fullstop, punctuation, numbers, symbols, convertParaToLines])

    const selectTimeHandler = useCallback((nextTime) => {
      if (selectedTime === nextTime) {
        dispatch(setTypingStartTime({ selectedTime: null }));
        return;
      }
      dispatch(setTypingStartTime({ selectedTime: nextTime }));
    }, [dispatch, selectedTime]);

    const refreshHandler = useCallback(async () => {
      await setTypingParaLinesHandler();
    }, [setTypingParaLinesHandler]);

    const resetHandler = useCallback(async () => {
      await startAndResetTypingHandler();
    }, [startAndResetTypingHandler]);

    useEffect(() => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      startAndResetTypingHandler();
    }, [startAndResetTypingHandler]);

    useEffect(() => {
      updateParaLinesHandler();
    }, [updateParaLinesHandler]);

    useEffect(() => {
      if (!originalPara) return;

      let resizeTimeout;

      const syncLinesForCurrentBoxSize = () => {
        const nextParaLines = convertParaToLines(originalPara);
        if (!nextParaLines) return;

        dispatch(setTypingParaLines({
          para: originalPara,
          paraLines: nextParaLines
        }));
      };

      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          syncLinesForCurrentBoxSize();
        }, 200);
      };

      window.addEventListener('resize', handleResize);
      syncLinesForCurrentBoxSize();

      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    }, [dispatch, originalPara, convertParaToLines]);

  if (!isClient) return null;


  return (
    <>
      <style jsx global>{`
        select,
        option {
          cursor: pointer !important;
        }
      `}</style>

      <div
        className={`flex items-center justify-center w-full overflow-hidden transition-all duration-300 ease-in-out ${isHidden ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'}`}
        style={{ maxHeight: isHidden ? 0 : 200 }}
      >
        <div
          className="flex flex-wrap items-center justify-center gap-4 px-4 sm:px-6 py-3 rounded-lg border mt-10"
          style={{
            backgroundColor: activeTheme.divColor,
            borderColor: activeTheme.divColor2
          }}
        >
          {type === 'para' && (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-2">
                  <span
                    title="Full stop"
                    onClick={toggleFullstopHandler}
                    className={optionStyle(fullstop)}
                  >
                    #.
                  </span>
                  <span
                    title="Numbers"
                    onClick={toggleNumbersHandler}
                    className={optionStyle(numbers)}
                  >
                    #123
                  </span>

                  <span
                    title="Punctuation"
                    onClick={togglePunctuationHandler}
                    className={optionStyle(punctuation)}
                  >
                    #Aa
                  </span>

                  <span
                    title="Symbols"
                    onClick={toggleSymbolsHandler}
                    className={optionStyle(symbols)}
                  >
                    #@
                  </span>
                </div>
              </div>

              <hr className="w-px h-10 border-0" style={{ backgroundColor: activeTheme.divColor2 }} />
            </>
          )}

          {type === 'para' && (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <div
                    className="relative"
                    style={{
                      borderBottom: `1px solid ${activeTheme.divColor2}`
                    }}
                  >
                    <select
                      value={difficulty}
                      onChange={changeDifficultyHandler}
                      className="pl-2 pr-6 py-1 text-xs font-medium select-none outline-none appearance-none rounded-t-md cursor-pointer transition "
                      style={{
                        backgroundColor: activeTheme.bgColor,
                        color: activeTheme.textColor
                      }}
                    >
                      <option value="easy" style={{ backgroundColor: activeTheme.divColor, color: activeTheme.textColor, cursor: 'pointer' }}>Easy</option>
                      <option value="hard" style={{ backgroundColor: activeTheme.divColor, color: activeTheme.textColor, cursor: 'pointer' }}>Hard</option>
                    </select>
                    <IoChevronDown
                      size={12}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: activeTheme.textColor2 }}
                    />
                  </div>

                  <div
                    className="relative"
                    style={{
                      borderBottom: `1px solid ${activeTheme.divColor2}`
                    }}
                  >
                    <select
                      value={length}
                      onChange={changeLengthHandler}
                      className="pl-2 pr-6 py-1 text-xs font-medium select-none outline-none appearance-none rounded-t-md cursor-pointer transition"
                      style={{
                        backgroundColor: activeTheme.bgColor,
                        color: activeTheme.textColor
                      }}
                    >
                      <option value="short" style={{ backgroundColor: activeTheme.divColor, color: activeTheme.textColor, cursor: 'pointer' }}>Short</option>
                      <option value="long" style={{ backgroundColor: activeTheme.divColor, color: activeTheme.textColor, cursor: 'pointer' }}>Long</option>
                    </select>
                    <IoChevronDown
                      size={12}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: activeTheme.textColor2 }}
                    />
                  </div>

                  <span
                    onClick={() => setShowCustomPara(true)}
                    className="flex h-6.5 items-center justify-center px-1 cursor-pointer text-gray-400 hover:text-yellow-400 transition"
                    title="Custom Paragraph"
                  >
                    <BiCustomize size={18} />
                  </span>
                </div>
              </div>

              <hr className="w-px h-10 border-0" style={{ backgroundColor: activeTheme.divColor2 }} />
            </>
          )}

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <span
                onClick={() => changeTypeHandler({ target: { value: 'para' } })}
                className={optionStyle(type === 'para')}
              >
                Para
              </span>

              <span
                onClick={() => changeTypeHandler({ target: { value: 'quote' } })}
                className={optionStyle(type === 'quote')}
              >
                Quote
              </span>
            </div>
          </div>

          <hr className="w-px h-10 border-0" style={{ backgroundColor: activeTheme.divColor2 }} />

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2 items-center">
              {[30, 60, 120].map(t => (
                <span
                  key={t}
                  onClick={() => selectTimeHandler(t)}
                  className={optionStyle(selectedTime === t)}
                >
                  {t < 60 ? `${t}s` : `${t / 60}m`}
                </span>
              ))}

              <span
                onClick={() => setShowCustomTime(true)}
                className="cursor-pointer text-gray-400 hover:text-yellow-400 transition"
                title="Custom Time"
              >
                <BiCustomize size={18} />
              </span>
            </div>
          </div>

          <hr className="w-px h-10 border-0" style={{ backgroundColor: activeTheme.divColor2 }} />

          <button
            onClick={refreshHandler}
            className="flex items-center justify-center p-2 rounded-md cursor-pointer text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition"
            title="Refresh"
          >
            <RiRefreshLine size={18} />
          </button>

          <button
            onClick={resetHandler}
            className="flex items-center justify-center p-2 rounded-md cursor-pointer text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition"
            title="Reset"
          >
            <RiResetRightFill size={18} />
          </button>
        </div>
      </div>

      {showCustomTime && (
        <CustomTime
          isOpen={showCustomTime}
          onClose={() => setShowCustomTime(false)}
        />
      )}

      {showCustomPara && type === 'para' && (
        <CustomPara
          isOpen={showCustomPara}
          onClose={() => setShowCustomPara(false)}
        />
      )}
    </>
  )
}

export default Menu
