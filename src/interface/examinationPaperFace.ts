export interface ExaminationPaperState {
    activeTab: string;
    examPaperTabList: examPaperTabList[]
    
}

interface examPaperTabList {
    label: string;
    value: string
}