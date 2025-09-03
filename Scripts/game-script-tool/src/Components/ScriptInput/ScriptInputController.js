import React, { useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import { appStateAtom } from "../../Stores/atom";
import { blockListSelector } from "../../Stores/selector";
import { OPTION_MINIMUM_COUNT } from "../../Utils/Constant";
import { DEFAULT_SCENE, APPROVAL_STATUS } from "./constant";
import ScriptInputPresenter from "./ScriptInputPresenter";

function ScriptInput({ createNewBlock, modifyBlock, blockList, currentUser }) {
  const appState = useRecoilValue(appStateAtom);
  const { modifySceneId } = appState;

  const defaultScene = useMemo(
    () =>
      modifySceneId
        ? blockList.find((data) => data.sceneId === modifySceneId)
        : {
            ...DEFAULT_SCENE,
            createdBy: currentUser?.id || "anonymous",
            createdAt: new Date().toISOString(),
          },
    [blockList, modifySceneId, currentUser]
  );

  useEffect(() => {
    setFormData({ ...defaultScene });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let [formData, setFormData] = useState(defaultScene);

  const onInputChange = (e) => {
    const {
      name,
      value,
      dataset: { optionIndex, value: dataValue },
    } = e.target;

    if (optionIndex !== undefined) {
      // ✅ 선택지 관련 입력 처리 (점수 시스템 포함)
      setFormData((data) => {
        const updatedOptions = [...data.options];

        if (name === "speed" || name === "accuracy") {
          // 점수 필드 처리 (협업 점수 제거)
          if (!updatedOptions[optionIndex].points) {
            updatedOptions[optionIndex].points = {
              speed: 0,
              accuracy: 0,
            };
          }
          updatedOptions[optionIndex].points[name] = parseInt(value) || 0;
        } else {
          // 기존 선택지 필드 처리
          updatedOptions[optionIndex][name] = value;
        }

        return { ...data, options: updatedOptions };
      });
    } else {
      // ✅ 일반 입력 필드 처리 (재난 유형, 난이도, 타이머 등)
      setFormData({
        ...formData,
        [name]: dataValue ? dataValue : value,
      });
    }
  };

  const onOptionAddClick = (e) => {
    setFormData({
      ...formData,
      options: formData.options.concat({
        answer: "",
        reaction: "",
        nextId: "",
        // ✅ 새로운 선택지에 기본 점수 시스템 추가
        points: {
          speed: 0,
          accuracy: 0,
        },
      }),
    });
  };

  const onOptionRemoveClick = (e) => {
    if (formData.options.length > OPTION_MINIMUM_COUNT)
      setFormData((formData) => ({
        ...formData,
        options: formData.options.slice(0, formData.options.length - 1),
      }));
  };

  // ✅ 승인 요청 처리
  const onApprovalRequest = () => {
    if (!formData.sceneId || !formData.sceneScript.trim()) {
      alert("시나리오 ID와 상황 설명을 모두 입력해야 승인 요청이 가능합니다.");
      return;
    }

    const updatedFormData = {
      ...formData,
      approvalStatus: APPROVAL_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "anonymous",
    };

    setFormData(updatedFormData);
    
    // 승인 요청 알림
    alert("승인 요청이 완료되었습니다. 관리자의 검토를 기다려주세요.");
  };

  const onNewBlockClick = (e) => {
    if (formData.sceneId.length === 0) {
      alert("시나리오 ID를 입력하세요.");
      return;
    }

    // ✅ 중복 검사 로직 개선
    const existingBlock = blockList.find(
      (block) => block.sceneId === formData.sceneId
    );
    if (existingBlock) {
      alert("중복되는 시나리오 ID가 있습니다.");
      return;
    }

    // ✅ 필수 필드 검증
    if (!formData.disasterType) {
      alert("재난 유형을 선택하세요.");
      return;
    }

    if (!formData.difficulty) {
      alert("난이도를 선택하세요.");
      return;
    }

    if (!formData.timeLimit || formData.timeLimit < 10) {
      alert("제한 시간은 최소 10초 이상이어야 합니다.");
      return;
    }

    if (formData.sceneScript.trim().length === 0) {
      alert("상황 설명을 입력하세요.");
      return;
    }

    if (createNewBlock) {
      // ✅ 승인 상태와 사용자 정보 포함하여 저장
      const blockData = {
        ...formData,
        approvalStatus: formData.approvalStatus || APPROVAL_STATUS.DRAFT,
        createdAt: formData.createdAt || new Date().toISOString(),
        createdBy: formData.createdBy || currentUser?.id || "anonymous",
      };

      createNewBlock(blockData);
      setFormData({
        ...defaultScene,
        createdBy: currentUser?.id || "anonymous",
        createdAt: new Date().toISOString(),
        options: [
          {
            answer: "",
            reaction: "",
            nextId: "",
            points: {
              speed: 0,
              accuracy: 0,
            },
          },
        ],
      });
    }
  };

  const onModifyBlockClick = (e) => {
    // ✅ 수정 시에도 동일한 검증 적용
    if (!formData.disasterType) {
      alert("재난 유형을 선택하세요.");
      return;
    }

    if (!formData.difficulty) {
      alert("난이도를 선택하세요.");
      return;
    }

    if (!formData.timeLimit || formData.timeLimit < 10) {
      alert("제한 시간은 최소 10초 이상이어야 합니다.");
      return;
    }

    if (formData.sceneScript.trim().length === 0) {
      alert("상황 설명을 입력하세요.");
      return;
    }

    // ✅ 수정 시 승인 상태를 초안으로 변경
    const modifiedBlockData = {
      ...formData,
      approvalStatus: APPROVAL_STATUS.DRAFT,
      approvedBy: "",
      approvedAt: "",
      rejectionReason: "",
    };

    modifyBlock(modifiedBlockData);
  };

  return (
    <ScriptInputPresenter
      isModifyMode={modifySceneId !== null}
      formData={formData}
      onInputChange={onInputChange}
      onOptionAddClick={onOptionAddClick}
      onOptionRemoveClick={onOptionRemoveClick}
      onNewBlockClick={onNewBlockClick}
      onModifyBlockClick={onModifyBlockClick}
      onApprovalRequest={onApprovalRequest}
      currentUser={currentUser}
    />
  );
}

export default ScriptInput;
