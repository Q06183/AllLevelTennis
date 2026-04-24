import { Skill, Level, Drill } from '../types';

export const drills: Drill[] = [
  {
    id: "drill-fh-catch",
    name: "身前抓球练习",
    description: "纠正击球点过后的问题",
    steps: ["教练在网前手抛球", "学员不拿拍，用非持拍手在身前抓住球", "体会重心前移与身前击球的空间感"],
    difficulty: 1
  },
  {
    id: "drill-fh-core",
    name: "药球抛掷练习",
    description: "纠正手臂发力#、无躯干转动的问题",
    steps: ["双手持实心药球", "模拟正手引拍动作", "蹬地转体将药球向前抛给教练"],
    difficulty: 2
  },
  {
    id: "drill-bh-balance",
    name: "单腿反手挥拍",
    description: "纠正反手击球时身体不平衡的问题",
    steps: ["单腿站立（前脚）", "保持身体平衡", "进行反手空挥拍练习"],
    difficulty: 2
  },
  {
    id: "drill-serve-toss",
    name: "抛球稳定性练习",
    description: "纠正发球抛球不稳定的问题",
    steps: ["在身前放置一个目标（如球拍或拍套）", "练习抛球，让球落在目标上", "不进行击球动作"],
    difficulty: 1
  },
  {
    id: "drill-volley-block",
    name: "网前挡球练习",
    description: "纠正截击时引拍过大的问题",
    steps: ["教练在底线大力击球", "学员在网前保持拍面固定", "只做挡球动作，体会借力打力"],
    difficulty: 2
  },
  {
    id: "drill-slice-open",
    name: "切削拍面练习",
    description: "纠正切削时拍面太关导致下网",
    steps: ["教练手抛球", "学员体会拍面打开，像端盘子一样", "从上往下切削球的中下部"],
    difficulty: 2
  },
  {
    id: "drill-footwork-split",
    name: "分腿垫步(Split Step)练习",
    description: "纠正启动慢、没有分腿垫步的问题",
    steps: ["教练准备击球前", "学员在原地轻轻跳起", "在教练击球瞬间双脚同时落地，准备启动"],
    difficulty: 2
  },
  {
    id: "drill-strategy-cross",
    name: "斜线相持练习",
    description: "纠正比赛中盲目改变线路导致失误",
    steps: ["双方只允许打斜线", "如果打出直线则算失分", "培养斜线相持的耐心和稳定性"],
    difficulty: 3
  },
  {
    id: "drill-fh-depth-target",
    name: "底线深区目标练习",
    description: "纠正正手击球太浅，容易被对手攻击的问题",
    steps: ["在发球线到底线之间设置目标区域", "要求学员每一拍正手都必须落入该区域", "未落入区域则重新计数"],
    difficulty: 3
  },
  {
    id: "drill-serve-pronate",
    name: "发球小臂内旋练习",
    description: "纠正发球没有鞭打、靠手臂推球的问题",
    steps: ["跪姿或坐在椅子上发球（消除腿部发力）", "强调拍头掉落与小臂内旋（Pronation）", "体会纯粹的手腕和小臂鞭打感觉"],
    difficulty: 4
  },
  {
    id: "drill-volley-footwork",
    name: "截击上步练习",
    description: "纠正截击时只伸手不上步的问题",
    steps: ["在学员前方放置标志物", "要求击球瞬间，异侧脚必须跨过标志物踩实", "建立‘用脚截击’而非‘用手截击’的肌肉记忆"],
    difficulty: 3
  },
  {
    id: "drill-slice-approach",
    name: "切削随球上网练习",
    description: "纠正切削放小球或随球上网时重心停留在后面的问题",
    steps: ["教练喂中场浅球", "学员跑动中切削，击球后顺势继续向前冲向网前", "要求身体的动量完全向前，不可后仰"],
    difficulty: 4
  },
  {
    id: "drill-footwork-recovery",
    name: "击球后交叉步回位练习",
    description: "纠正击球后回位慢、依然使用并步导致被动的问题",
    steps: ["学员在单打边线外侧击球", "击球后第一步必须是交叉步（Cross-over step）强力蹬地回位", "回位到中线后进行分腿垫步"],
    difficulty: 4
  },
  {
    id: "drill-strategy-pattern",
    name: "发球+正手+1 固定套路练习",
    description: "纠正比赛中没有得分套路，全靠临场反应的问题",
    steps: ["一发要求发向外角拉开角度", "对手回球后，必须用正手进攻空当（+1拍）", "反复练习这一得分套路直到形成条件反射"],
    difficulty: 5
  },
  {
    id: "drill-topspin-wiper",
    name: "雨刷器挥拍练习",
    description: "纠正击球太平、缺乏摩擦的问题",
    steps: ["在围网前或铁丝网前练习", "拍面贴着网面，从下往上做雨刷器动作", "体会拍面与球网（模拟球）的摩擦感"],
    difficulty: 2
  },
  {
    id: "drill-topspin-drive",
    name: "上旋推挡结合练习",
    description: "纠正摩擦过多、向前推送不够导致球太浅的问题",
    steps: ["在发球线后一步站位", "先用平击的方式将球打深", "在平击的基础上逐渐加入向上的摩擦", "要求球必须落在发球线和底线之间"],
    difficulty: 3
  },
  {
    id: "drill-bh-drop",
    name: "反手拍头掉落练习",
    description: "纠正反手拍头掉不下去导致无法产生上旋的问题",
    steps: ["将球拍夹在腋下或身后", "体会拍头自然下垂的感觉", "从极低的拍头位置启动，向上挥拍捕捉抛来的球"],
    difficulty: 2
  }
];

export const skills: Skill[] = [
  // 正手相关技能
  { 
    id: "forehand-basic", 
    name: "正手基础击球", 
    category: "正手", 
    description: "基本的正手击球动作", 
    tips: ["保持正确的握拍（推荐半西方式握拍）", "转动身体带动挥拍", "击球点在身体侧前方", "跟随动作完整", "保持手腕固定", "眼睛紧盯球"], 
    difficulty: 1, 
    imageSource: require('../../assets/tennis_skills/forehand/forehand-basic.png'),
    painPoints: [
      { id: "pp-fh-late", description: "击球点太靠后", recommendedDrillIds: ["drill-fh-catch"] },
      { id: "pp-fh-arm", description: "纯手臂发力，无转体", recommendedDrillIds: ["drill-fh-core"] }
    ]
  },
  {
    id: "forehand-topspin-basic",
    name: "正手基础上旋",
    category: "正手",
    description: "掌握现代网球基本的正手上旋击球，增加过网高度和落地后的弹跳。",
    tips: ["采用半西方或西方式握拍", "拍头低于击球点", "由下至上刷球", "像雨刷器一样的随挥动作", "增加拍头速度", "身体随转体向上发力"],
    difficulty: 3,
    painPoints: [
      { id: "pp-fh-topspin-flat", description: "击球太平，没有摩擦导致出界", recommendedDrillIds: ["drill-topspin-wiper"] }
    ]
  },
  {
    id: "forehand-topspin-heavy",
    name: "正手强烈上旋",
    category: "正手",
    description: "打出具有强烈上旋的红土式正手，制造极高的落地弹跳，把对手逼退到底线之后。",
    tips: ["引拍时拍头更深地掉落", "极快的垂直向上挥拍速度", "强调腿部向上蹬伸的力量", "随挥可以绕过头顶（纳达尔式）", "击球点靠前且稍高"],
    difficulty: 4,
    painPoints: [
      { id: "pp-fh-topspin-short", description: "摩擦过多，向前推送不够导致球太浅", recommendedDrillIds: ["drill-topspin-drive"] }
    ]
  },
  {
    id: "forehand-topspin-lob",
    name: "正手上旋挑高球",
    category: "正手",
    description: "在被动防守或面对对手上网时，使用正手打出带有强烈上旋的挑高球，越过对手并快速下坠。",
    tips: ["拍面比正常上旋更打开", "挥拍轨迹更加垂直向上", "利用手腕和小臂快速摩擦", "隐蔽动作，让对手以为是普通击球"],
    difficulty: 5
  },
  { id: "forehand-control", name: "正手方向控制", category: "正手", description: "控制正手击球的方向", tips: ["提前准备，判断来球", "瞄准目标区域", "调整拍面角度", "保持身体平衡", "随球移动", "使用小步调整"], difficulty: 2, imageSource: require('../../assets/tennis_skills/forehand/forehand-control.png') },
  { 
    id: "forehand-depth", 
    name: "正手深度控制", 
    category: "正手", 
    description: "控制正手击球的深度", 
    tips: ["增加击球力量", "调整击球点高度", "使用上旋", "充分转体", "跟随动作向前", "瞄准底线附近"], 
    difficulty: 3, 
    imageSource: require('../../assets/tennis_skills/forehand/forehand-depth.png'),
    painPoints: [
      { id: "pp-fh-shallow", description: "回球太浅，落点不到发球线", recommendedDrillIds: ["drill-fh-depth-target"] }
    ]
  },
  { id: "forehand-power", name: "正手力量击球", category: "正手", description: "打出有力的正手击球", tips: ["充分转体，利用核心力量", "使用腿部力量蹬地", "击球点靠前", "加速挥拍", "保持手腕稳定", "随球跟进"], difficulty: 4, imageSource: require('../../assets/tennis_skills/forehand/forehand-power.png') },
  { id: "forehand-variation", name: "正手变化击球", category: "正手", description: "使用不同的正手击球方式", tips: ["混合上旋和平击球", "变化节奏和速度", "调整击球角度", "使用放小球和斜线球", "根据对手位置变化球路", "保持动作一致性"], difficulty: 5, imageSource: require('../../assets/tennis_skills/forehand/forehand-variation.png') },
  
  // 反手相关技能
  { 
    id: "backhand-basic", 
    name: "反手基础击球", 
    category: "反手", 
    description: "基本的反手击球动作", 
    tips: ["选择合适的握拍（单手或双手）", "保持平衡", "击球点在身体侧前方", "跟随动作完整", "非持拍手保持平衡", "提前准备"], 
    difficulty: 1, 
    imageSource: require('../../assets/tennis_skills/backhand/backhand-basic.png'),
    painPoints: [
      { id: "pp-bh-balance", description: "击球时身体失去平衡", recommendedDrillIds: ["drill-bh-balance"] }
    ]
  },
  {
    id: "backhand-topspin-basic",
    name: "反手基础上旋",
    category: "反手",
    description: "掌握反手（单手或双手）的上旋击球，增加过网保险和控制力。",
    tips: ["双手反手：非持拍手主导发力摩擦", "单手反手：东方反手握拍，拍头掉落", "由下至上挥拍", "击球点在身体侧前方", "完整的随挥动作"],
    difficulty: 3,
    painPoints: [
      { id: "pp-bh-topspin-net", description: "反手拍头掉不下去，导致击球下网或太平", recommendedDrillIds: ["drill-bh-drop"] }
    ]
  },
  {
    id: "backhand-topspin-heavy",
    name: "反手强烈上旋",
    category: "反手",
    description: "在反手位制造大角度和高弹跳的强烈上旋球，压制对手。",
    tips: ["更低的重心准备", "加快向上的拍头速度", "单手反手强调直臂向上提拉", "双手反手强调左手（右手持拍者）的雨刷器动作"],
    difficulty: 4
  },
  {
    id: "backhand-topspin-lob",
    name: "反手上旋挑高球",
    category: "反手",
    description: "在反手位被动时或面对上网对手，打出带有上旋的过顶球。",
    tips: ["降低重心，拍头充分掉落", "向斜上方快速提拉", "动作要隐蔽", "双手反手可利用手腕制造额外摩擦"],
    difficulty: 5
  },
  { id: "backhand-control", name: "反手方向控制", category: "反手", description: "控制反手击球的方向", tips: ["提前准备，判断来球", "稳定拍面", "随球移动", "调整步法", "瞄准目标", "保持身体协调"], difficulty: 2, imageSource: require('../../assets/tennis_skills/backhand/backhand-control.png') },
  { id: "backhand-depth", name: "反手深度控制", category: "反手", description: "控制反手击球的深度", tips: ["增加击球力量", "调整击球点", "使用上旋", "充分转体", "跟随动作向前", "瞄准底线附近"], difficulty: 3, imageSource: require('../../assets/tennis_skills/backhand/backhand-depth.png') },
  { id: "backhand-power", name: "反手力量击球", category: "反手", description: "打出有力的反手击球", tips: ["充分转体，利用核心力量", "使用腿部力量蹬地", "击球点靠前", "加速挥拍", "保持手腕稳定", "随球跟进"], difficulty: 4, imageSource: require('../../assets/tennis_skills/backhand/backhand-power.png') },
  { id: "backhand-variation", name: "反手变化击球", category: "反手", description: "使用不同的反手击球方式", tips: ["混合上旋和平击球", "变化节奏和速度", "调整击球角度", "使用切削和放小球", "根据对手位置变化球路", "保持动作一致性"], difficulty: 5, imageSource: require('../../assets/tennis_skills/backhand/backhand-variation.png') },
  
  // 发球相关技能
  { 
    id: "serve-basic", 
    name: "发球基础动作", 
    category: "发球", 
    description: "基本的发球动作", 
    tips: ["正确的抛球（垂直上升）", "身体协调发力", "使用大陆式握拍", "跟随动作完整", "保持平衡", "眼睛紧盯球"], 
    difficulty: 2, 
    imageSource: require('../../assets/tennis_skills/serve/serve-basic.png'),
    painPoints: [
      { id: "pp-serve-toss", description: "抛球不稳，到处乱跑", recommendedDrillIds: ["drill-serve-toss"] }
    ]
  },
  { id: "serve-placement", name: "发球落点控制", category: "发球", description: "控制发球的落点", tips: ["瞄准目标区域", "调整抛球位置", "控制拍面角度", "根据对手位置选择落点", "保持动作一致性", "练习不同落点"], difficulty: 3, imageSource: require('../../assets/tennis_skills/serve/serve-placement.png') },
  { 
    id: "serve-power", 
    name: "发球力量", 
    category: "发球", 
    description: "增加发球的力量", 
    tips: ["充分挥臂，利用鞭打效应", "使用腿部力量蹬地", "提高抛球高度", "身体协调发力", "核心力量参与", "保持动作流畅"], 
    difficulty: 4, 
    imageSource: require('../../assets/tennis_skills/serve/serve-power.png'),
    painPoints: [
      { id: "pp-serve-push", description: "发球全靠推，没有鞭打", recommendedDrillIds: ["drill-serve-pronate"] }
    ]
  },
  { id: "serve-spin", name: "发球旋转", category: "发球", description: "添加旋转到发球", tips: ["调整拍面角度", "改变挥拍轨迹", "控制触球点", "练习上旋和侧旋", "保持抛球稳定", "随球动作完整"], difficulty: 4, imageSource: require('../../assets/tennis_skills/serve/serve-spin.png') },
  { id: "serve-variation", name: "发球变化", category: "发球", description: "使用不同类型的发球", tips: ["混合平击、上旋和切削发球", "变化节奏和速度", "调整落点", "根据对手弱点选择发球类型", "保持动作一致性", "练习不同场景的发球"], difficulty: 5, imageSource: require('../../assets/tennis_skills/serve/serve-variation.png') },
  
  // 切削相关技能
  { 
    id: "slice-basic", 
    name: "切削基础", 
    category: "切削", 
    description: "基本的切削击球", 
    tips: ["打开拍面", "向下切削球的中下部", "控制力量", "使用大陆式握拍", "保持手腕稳定", "随球动作简短"], 
    difficulty: 2, 
    imageSource: require('../../assets/tennis_skills/slice/slice-basic.png'),
    painPoints: [
      { id: "pp-slice-net", description: "切削经常下网，拍面太关", recommendedDrillIds: ["drill-slice-open"] }
    ]
  },
  { id: "slice-control", name: "切削控制", category: "切削", description: "控制切削球的方向和深度", tips: ["调整拍面角度", "控制挥拍速度", "瞄准目标", "保持身体平衡", "随球动作向前", "练习不同落点"], difficulty: 3, imageSource: require('../../assets/tennis_skills/slice/slice-control.png') },
  { 
    id: "slice-drop", 
    name: "切削放小球", 
    category: "切削", 
    description: "使用切削技术放小球", 
    tips: ["轻柔触球", "控制力量", "瞄准网前", "打开拍面", "随球动作简短", "练习精准度"], 
    difficulty: 4, 
    imageSource: require('../../assets/tennis_skills/slice/slice-drop.png'),
    painPoints: [
      { id: "pp-slice-stop", description: "放小球后重心向后仰，不随球上网", recommendedDrillIds: ["drill-slice-approach"] }
    ]
  },
  
  // 截击相关技能
  { 
    id: "volley-basic", 
    name: "截击基础", 
    category: "截击", 
    description: "基本的网前截击", 
    tips: ["保持拍头向上", "快速反应", "控制力量", "使用大陆式握拍", "小引拍", "随球动作简短"], 
    difficulty: 2, 
    imageSource: require('../../assets/tennis_skills/volley/volley-basic.png'),
    painPoints: [
      { id: "pp-volley-swing", description: "像底线一样大幅度挥拍", recommendedDrillIds: ["drill-volley-block"] }
    ]
  },
  { id: "volley-control", name: "截击控制", category: "截击", description: "控制截击球的方向和深度", tips: ["调整拍面", "瞄准目标", "随球移动", "保持身体平衡", "小步调整", "练习不同角度"], difficulty: 3, imageSource: require('../../assets/tennis_skills/volley/volley-control.png') },
  { 
    id: "volley-approach", 
    name: "截击进攻", 
    category: "截击", 
    description: "使用截击技术进攻", 
    tips: ["快速上网", "保持平衡", "果断击球", "瞄准空当", "随球跟进", "练习高压球"], 
    difficulty: 4, 
    imageSource: require('../../assets/tennis_skills/volley/volley-approach.png'),
    painPoints: [
      { id: "pp-volley-lazy", description: "击球时只伸手不上步", recommendedDrillIds: ["drill-volley-footwork"] }
    ]
  },
  
  // 其他技能
  { 
    id: "footwork-basic", 
    name: "步法基础", 
    category: "步法", 
    description: "基本的网球步法", 
    tips: ["保持移动", "使用小步调整", "提前预判", "保持重心低", "快速启动", "练习侧滑步"], 
    difficulty: 1, 
    imageSource: require('../../assets/tennis_skills/footwork/footwork-basic.png'),
    painPoints: [
      { id: "pp-footwork-lazy", description: "不跑动，站在原地等球", recommendedDrillIds: ["drill-footwork-split"] }
    ]
  },
  { 
    id: "footwork-advanced", 
    name: "高级步法", 
    category: "步法", 
    description: "高级的网球步法", 
    tips: ["交叉步移动", "滑步", "急停急启", "碎步调整", "前后移动", "左右移动"], 
    difficulty: 3, 
    imageSource: require('../../assets/tennis_skills/footwork/footwork-advanced.png'),
    painPoints: [
      { id: "pp-footwork-recover", description: "大角度击球后回位慢，被动挨打", recommendedDrillIds: ["drill-footwork-recovery"] }
    ]
  },
  { id: "court-coverage", name: "球场覆盖", category: "步法", description: "有效地覆盖整个球场", tips: ["保持中心位置", "提前移动", "合理分配体力", "预判来球", "快速反应", "练习多方向移动"], difficulty: 4, imageSource: require('../../assets/tennis_skills/footwork/court-coverage.png') },
  { 
    id: "strategy-basic", 
    name: "基本战术", 
    category: "战术", 
    description: "基本的网球战术", 
    tips: ["了解场地位置", "控制比赛节奏", "利用对手弱点", "保持 consistency", "合理运用力量", "专注于打好每一分"], 
    difficulty: 2, 
    imageSource: require('../../assets/tennis_skills/strategy/strategy-basic.png'),
    painPoints: [
      { id: "pp-strategy-random", description: "盲目发力，没有线路规划", recommendedDrillIds: ["drill-strategy-cross"] }
    ]
  },
  { 
    id: "strategy-advanced", 
    name: "高级战术", 
    category: "战术", 
    description: "高级的网球战术", 
    tips: ["变化球路", "调整比赛计划", "心理战术", "根据对手风格调整策略", "利用场地优势", "保持冷静和专注"], 
    difficulty: 5, 
    imageSource: require('../../assets/tennis_skills/strategy/strategy-advanced.png'),
    painPoints: [
      { id: "pp-strategy-no-pattern", description: "比赛中没有得分套路，全靠临场反应", recommendedDrillIds: ["drill-strategy-pattern"] }
    ]
  }
];

export const levels: Level[] = [
  {
    id: "1.0",
    name: "初学者",
    description: "初学者（包括第一次打网球的人）",
    skills: ["forehand-basic", "backhand-basic", "footwork-basic"],
    expectedTime: "1-5 小时",
  },
  {
    id: "1.5",
    name: "有限经验",
    description: "有限经验，主要致力于将球打回场内",
    skills: ["forehand-basic", "backhand-basic", "footwork-basic", "serve-basic"],
    expectedTime: "10-20 小时",
  },
  {
    id: "2.0",
    name: "缺乏经验",
    description: "缺乏球场经验，击球技术需要发展",
    skills: ["forehand-basic", "backhand-basic", "footwork-basic", "serve-basic", "volley-basic"],
    expectedTime: "30-50 小时",
  },
  {
    id: "2.5",
    name: "正在学习",
    description: "正在学习判断球的方向，球场覆盖有限",
    skills: ["forehand-basic", "forehand-control", "backhand-basic", "backhand-control", "footwork-basic", "serve-basic", "volley-basic", "slice-basic"],
    expectedTime: "60-100 小时",
  },
  {
    id: "3.0",
    name: "相当稳定",
    description: "打中速球时相当稳定，但对所有击球都不舒适",
    skills: ["forehand-basic", "forehand-control", "forehand-topspin-basic", "backhand-basic", "backhand-control", "backhand-topspin-basic", "footwork-basic", "footwork-advanced", "serve-basic", "serve-placement", "volley-basic", "volley-control", "slice-basic", "strategy-basic"],
    expectedTime: "1-2 年 (规律练习)",
  },
  {
    id: "3.5",
    name: "方向控制不错",
    description: "中速球的方向控制已经不错，但击球的深度和变化还不够",
    skills: ["forehand-basic", "forehand-control", "forehand-depth", "forehand-topspin-basic", "backhand-basic", "backhand-control", "backhand-depth", "backhand-topspin-basic", "footwork-basic", "footwork-advanced", "serve-basic", "serve-placement", "volley-basic", "volley-control", "slice-basic", "slice-control", "strategy-basic"],
    expectedTime: "2-3 年 (规律练习)",
  },
  {
    id: "4.0",
    name: "有相当把握",
    description: "击球已经有相当的把握，回击中速球有深度",
    skills: ["forehand-basic", "forehand-control", "forehand-depth", "forehand-power", "forehand-topspin-basic", "forehand-topspin-heavy", "backhand-basic", "backhand-control", "backhand-depth", "backhand-power", "backhand-topspin-basic", "backhand-topspin-heavy", "footwork-basic", "footwork-advanced", "court-coverage", "serve-basic", "serve-placement", "serve-power", "volley-basic", "volley-control", "volley-approach", "slice-basic", "slice-control", "strategy-basic", "strategy-advanced"],
    expectedTime: "3-5 年+ (含比赛经验)",
  },
  {
    id: "4.5",
    name: "力量和稳定性",
    description: "力量和稳定性已经成为主要武器",
    skills: ["forehand-basic", "forehand-control", "forehand-depth", "forehand-power", "forehand-variation", "forehand-topspin-basic", "forehand-topspin-heavy", "forehand-topspin-lob", "backhand-basic", "backhand-control", "backhand-depth", "backhand-power", "backhand-variation", "backhand-topspin-basic", "backhand-topspin-heavy", "backhand-topspin-lob", "footwork-basic", "footwork-advanced", "court-coverage", "serve-basic", "serve-placement", "serve-power", "serve-spin", "volley-basic", "volley-control", "volley-approach", "slice-basic", "slice-control", "slice-drop", "strategy-basic", "strategy-advanced"],
    expectedTime: "业余高水平选手",
  },
  {
    id: "5.0",
    name: "良好预判能力",
    description: "有良好的击球预判能力，经常有出色的击球",
    skills: ["forehand-basic", "forehand-control", "forehand-depth", "forehand-power", "forehand-variation", "forehand-topspin-basic", "forehand-topspin-heavy", "forehand-topspin-lob", "backhand-basic", "backhand-control", "backhand-depth", "backhand-power", "backhand-variation", "backhand-topspin-basic", "backhand-topspin-heavy", "backhand-topspin-lob", "footwork-basic", "footwork-advanced", "court-coverage", "serve-basic", "serve-placement", "serve-power", "serve-spin", "serve-variation", "volley-basic", "volley-control", "volley-approach", "slice-basic", "slice-control", "slice-drop", "strategy-basic", "strategy-advanced"],
    expectedTime: "准专业/专业退役",
  }
];
