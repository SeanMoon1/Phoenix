import React, { useEffect, useRef, useState } from 'react';

type Props = {
  title: string;
  content: string;
  sceneScript: string;
  showHeroImage?: boolean;
  heroSrc?: string | undefined;
};

const SituationCard = React.forwardRef<HTMLElement, Props>(
  ({ title, content, sceneScript, showHeroImage = false, heroSrc }, ref) => {
    const paragraphs = (content ?? '').trim().split(/\n{2,}/);

    // 이미지 표시 제어
    const [imageVisible, setImageVisible] = useState<boolean>(!!showHeroImage);
    const [textVisible, setTextVisible] = useState<boolean>(!showHeroImage);
    // 페이드 아웃 제어 (이미지를 천천히 opacity로 사라지게 함)
    const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
    const IMAGE_FADE_MS = 700; // 페이드 아웃 지속 시간(밀리초) — 필요하면 조절하세요

    // 텍스트 높이 측정용 ref
    const measureRef = useRef<HTMLDivElement | null>(null);
    const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

    useEffect(() => {
      let tShow: number | undefined;
      let tFade: number | undefined;
      if (showHeroImage) {
        setIsFadingOut(false);
        setImageVisible(true);
        setTextVisible(false);
        // 텍스트 높이 측정(약간의 RAF 보장)
        requestAnimationFrame(() => {
          if (measureRef.current)
            setMeasuredHeight(measureRef.current.scrollHeight);
        });
        // 2초 후에 페이드 아웃 트리거 -> 페이드가 끝난 뒤 이미지 제거하고 텍스트 표시
        tShow = window.setTimeout(() => {
          setIsFadingOut(true);
          // 이미지 페이드가 끝나면 실제로 이미지를 언마운트하고 텍스트를 보이게 함
          tFade = window.setTimeout(() => {
            setImageVisible(false);
            setTextVisible(true);
            setIsFadingOut(false);
          }, IMAGE_FADE_MS);
        }, 2000);
      } else {
        // 바로 텍스트 표시
        setIsFadingOut(false);
        setImageVisible(false);
        setTextVisible(true);
        requestAnimationFrame(() => {
          if (measureRef.current)
            setMeasuredHeight(measureRef.current.scrollHeight);
        });
      }
      return () => {
        if (tShow) clearTimeout(tShow);
        if (tFade) clearTimeout(tFade);
      };
    }, [showHeroImage, content]);

    // 재측정: 내용/윈도우 리사이즈 시
    useEffect(() => {
      const onResize = () => {
        if (measureRef.current)
          setMeasuredHeight(measureRef.current.scrollHeight);
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
      <>
        {/* 제목 섹션: 항상 보이도록 유지 */}
        <section
          ref={ref}
          className="bg-white/80 dark:bg-black/40 rounded-2xl shadow-md p-4 mb-4 overflow-hidden"
        >
          <h1
            id="scene-title"
            className="text-2xl font-bold text-center relative"
          >
            {title}
          </h1>
        </section>

        {/* 내용 섹션: padding 유지(p-5 md:p-6). 이미지가 보이는 동안은 이미지가 동일 영역(패딩 포함)을 채우도록,
            이미지가 사라지면 같은 영역에 텍스트가 표시되며 레이아웃 점프가 없도록 텍스트 높이를 미리 측정해서 이미지 높이에 맞춤 */}
        <section className="bg-white/90 dark:bg-black/40 rounded-2xl shadow-md p-5 md:p-6 mb-6 leading-relaxed relative overflow-hidden">
          {/* 보이는 본문(렌더용). 측정용 텍스트 블록(시각적으로 숨김) */}
          <div
            ref={measureRef}
            aria-hidden
            className="invisible absolute left-0 top-0 w-full pointer-events-none"
            style={{ padding: 0 }}
          >
            <div className="p-5 md:p-6 max-w-[70ch] mx-auto">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-lg mb-3 whitespace-pre-line leading-loose"
                >
                  {p}
                </p>
              ))}
              <p className="text-base opacity-90 mt-4">{sceneScript}</p>
            </div>
          </div>

          {/* 이미지 레이어와 텍스트 레이어를 겹쳐서 렌더 (이미지는 opacity로 천천히 사라짐) */}
          <div
            className="relative rounded-2xl overflow-hidden -mx-5 md:-mx-6 -my-5 md:-my-6"
            style={{ height: measuredHeight ?? 420 }}
          >
            {/* 이미지 레이어: blur + opacity로 천천히 사라짐 */}
            {heroSrc && (imageVisible || isFadingOut) && (
              <div
                className="absolute inset-0"
                aria-hidden={!imageVisible && !isFadingOut}
                style={{
                  opacity: isFadingOut ? 0 : 1,
                  transition: `opacity ${IMAGE_FADE_MS}ms ease`,
                  pointerEvents: isFadingOut ? 'none' : 'auto',
                }}
              >
                <img
                  src={heroSrc}
                  alt=""
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                  style={{
                    objectPosition: 'center',
                    filter: isFadingOut ? 'blur(6px)' : 'blur(0px)',
                    transform: isFadingOut ? 'scale(1.03)' : 'scale(1)',
                    transition: `filter ${IMAGE_FADE_MS}ms ease, transform ${IMAGE_FADE_MS}ms ease`,
                  }}
                />
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    transition: `opacity ${IMAGE_FADE_MS}ms ease`,
                    opacity: isFadingOut ? 0 : 1,
                  }}
                />
              </div>
            )}

            {/* 텍스트 레이어: 이미지 사라진 뒤 페이드인 */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                textVisible
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="p-5 md:p-6 max-w-[70ch] mx-auto">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-lg mb-3 whitespace-pre-line leading-loose"
                  >
                    {p}
                  </p>
                ))}
                <p className="text-base opacity-90 mt-4">{sceneScript}</p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
);

export default SituationCard;
