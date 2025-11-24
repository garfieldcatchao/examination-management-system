import { api } from "../server/index";
import { SaveSnapshotRequest } from "../interface/monitoringFace";
import { isTrue } from "../utils";

let errorMsg = {
  success: false,
  data: null,
  message: "操作失败",
};

// 获取监控信息
export const getMonitoringInfoAction = async () => {
  const result = await api.monitoring.getMonitoringInfo();
  if (result && isTrue(result.success)) {
    return result;
  }
  return errorMsg;
};

// 保存快照
export const saveSnapshotAction = async (data: SaveSnapshotRequest) => {
  try {
    const result = await api.monitoring.saveSnapshot(data);
    if (result && isTrue(result.success)) {
      return result;
    }
    return errorMsg;
  } catch (error) {
    console.error('保存快照失败:', error);
    return errorMsg;
  }
};

// 批量保存快照
export const batchSaveSnapshotsAction = async (snapshots: SaveSnapshotRequest[]) => {
  try {
    const result = await api.monitoring.batchSaveSnapshots(snapshots);
    if (result && isTrue(result.success)) {
      return result;
    }
    return errorMsg;
  } catch (error) {
    console.error('批量保存快照失败:', error);
    return errorMsg;
  }
};

// 获取快照列表
export const getSnapshotsAction = async (examId: string, userId: string) => {
  try {
    const result = await api.monitoring.getSnapshots({ examId, userId });
    if (result && isTrue(result.success)) {
      return result;
    }
    return errorMsg;
  } catch (error) {
    console.error('获取快照列表失败:', error);
    return errorMsg;
  }
};
