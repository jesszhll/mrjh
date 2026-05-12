import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Settings2, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Timer as TimerIcon,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  X
} from 'lucide-react';
import { Task, Subject, UserProfile, TaskStatus, View } from './types';
import { INITIAL_SUBJECTS, TITLES } from './constants';

// --- Components ---

const ProgressBar = ({ progress, color = 'bg-brand-purple' }: { progress: number; color?: string }) => (
  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className={`h-full ${color}`}
    />
  </div>
);

export default function App() {
  const [view, setView] = useState<View>('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [profile, setProfile] = useState<UserProfile>({
    name: '宝贝',
    title: '小萌芽',
    points: 0,
    level: 1,
  });
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState<Task | null>(null);

  // Persistence
  useEffect(() => {
    const savedTasks = localStorage.getItem('study_tasks');
    const savedSubjects = localStorage.getItem('study_subjects');
    const savedProfile = localStorage.getItem('study_profile');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  useEffect(() => {
    localStorage.setItem('study_tasks', JSON.stringify(tasks));
    localStorage.setItem('study_subjects', JSON.stringify(subjects));
    localStorage.setItem('study_profile', JSON.stringify(profile));
  }, [tasks, subjects, profile]);

  // Derived Title
  useEffect(() => {
    const currentTitle = TITLES.reduce((prev, curr) => {
      if (profile.points >= curr.minPoints) return curr;
      return prev;
    });
    if (profile.title !== currentTitle.name) {
      setProfile(p => ({ ...p, title: currentTitle.name }));
    }
  }, [profile.points]);

  // Actions
  const addTask = (name: string, subjectId: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      subjectId,
      status: TaskStatus.TODO,
      points: 10,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setIsAddTaskOpen(false);
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (t.status === TaskStatus.TODO) {
          setProfile(p => ({ ...p, points: p.points + t.points }));
          return { ...t, status: TaskStatus.COMPLETED, completedAt: new Date().toISOString() };
        }
      }
      return t;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const addSubject = (name: string, icon: string, color: string) => {
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      icon,
      color,
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20 font-sans">
      {/* Platform header bar */}
      <div className="bg-[#A855F7] h-12 flex items-center px-6 justify-between text-white">
        <span className="text-sm font-medium">18:59</span>
        <div className="flex gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-white/40" />
          <div className="w-4 h-4 rounded-full border-2 border-white/40" />
          <div className="w-6 h-3 border-2 border-white/40 rounded-sm relative">
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-1 h-1 bg-white/40" />
          </div>
        </div>
      </div>

      {/* App Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 p-1.5 rounded-lg shadow-inner">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">每日学习机</h1>
        </div>
        <div className="bg-yellow-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-yellow-200">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-yellow-700">{profile.points}</span>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white flex px-4 mt-1 border-b border-gray-100 sticky top-[68px] z-10 overflow-x-auto no-scrollbar">
        {[
          { id: 'home', icon: BookOpen, label: '今日任务' },
          { id: 'calendar', icon: CalendarIcon, label: '学习日历' },
          { id: 'subjects', icon: Settings2, label: '管理科目' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as View)}
            className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-2 transition-all relative ${
              view === tab.id ? 'text-brand-purple' : 'text-gray-400'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${view === tab.id ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-bold">{tab.label}</span>
            {view === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 h-1 w-12 bg-brand-purple rounded-t-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Views */}
      <main className="px-6 py-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <HomeView 
              key="home"
              profile={profile}
              tasks={tasks.filter(t => {
                const today = new Date().toISOString().split('T')[0];
                return t.createdAt.split('T')[0] === today;
              })}
              subjects={subjects}
              onComplete={completeTask}
              onDelete={deleteTask}
              onStartTimer={(task) => {
                setActiveTimerTask(task);
                setView('timer');
              }}
              onOpenAdd={() => setIsAddTaskOpen(true)}
            />
          )}

          {view === 'calendar' && (
            <CalendarView 
              key="calendar"
              tasks={tasks}
              points={profile.points}
            />
          )}

          {view === 'subjects' && (
            <ManageSubjectsView 
              key="subjects"
              subjects={subjects}
              onAdd={addSubject}
              onRemove={removeSubject}
            />
          )}

          {view === 'timer' && activeTimerTask && (
            <TimerView 
              key="timer"
              task={activeTimerTask}
              subject={subjects.find(s => s.id === activeTimerTask.subjectId)!}
              onBack={() => setView('home')}
              onComplete={() => {
                completeTask(activeTimerTask.id);
                setView('home');
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Add Task Modal */}
      <AddTaskModal 
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        subjects={subjects}
        onAdd={addTask}
      />
    </div>
  );
}

// --- View Components ---

function HomeView({ profile, tasks, subjects, onComplete, onDelete, onStartTimer, onOpenAdd }: any) {
  const completedCount = tasks.filter((t: any) => t.status === TaskStatus.COMPLETED).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  
  const nextLevelPoints = TITLES.find(t => t.minPoints > profile.points)?.minPoints || profile.points + 100;
  const levelProgress = ((profile.points - (TITLES.find(t => t.name === profile.title)?.minPoints || 0)) / (nextLevelPoints - (TITLES.find(t => t.name === profile.title)?.minPoints || 0))) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Profile Card */}
      <div className="gradient-purple p-6 rounded-3xl text-white shadow-xl shadow-purple-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/80 text-sm mb-1">当前称号</p>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {profile.title} <span className="text-xl">🌱</span>
            </h2>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">总积分</p>
            <div className="flex items-center gap-1.5 justify-end">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-black">{profile.points}</span>
            </div>
          </div>
        </div>
        <ProgressBar progress={levelProgress} color="bg-white/40" />
        <p className="text-xs text-white/70 mt-2">再得 {nextLevelPoints - profile.points} 分升级 →</p>
      </div>

      {/* Today's Progress */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">今日进度</h3>
          <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
          <div className="mt-3 w-40">
            <ProgressBar progress={progress} color="bg-brand-purple" />
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black text-brand-purple leading-none">{completedCount}</span>
          <span className="text-xl font-bold text-gray-300">/{tasks.length}</span>
          <p className="text-xs text-gray-400 font-bold uppercase mt-1">完成任务</p>
        </div>
      </div>

      {/* Task List Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-gray-700">待完成 ({tasks.filter((t: any) => t.status === TaskStatus.TODO).length})</h3>
        </div>
        <button 
          onClick={onOpenAdd}
          className="bg-brand-purple text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg shadow-purple-200 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" /> 添加任务
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">今天还没有任务，快去添加吧！</p>
          </div>
        ) : (
          tasks.map((task: any) => {
            const subject = subjects.find((s: any) => s.id === task.subjectId);
            return (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ backgroundColor: subject?.color || '#eee' }}
                  >
                    {subject?.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{task.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 font-medium">{subject?.name}</span>
                      <span className="text-sm text-yellow-500 font-bold flex items-center gap-1">
                        +{task.points} <Star className="w-3 h-3 fill-yellow-400" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === TaskStatus.TODO ? (
                    <>
                      <button 
                        onClick={() => onStartTimer(task)}
                        className="p-2.5 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                      >
                        <TimerIcon className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => onComplete(task.id)}
                        className="p-2.5 rounded-full bg-green-50 text-green-500 hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                    </>
                  ) : (
                    <div className="bg-green-500 text-white p-2 rounded-full">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                  <button 
                    onClick={() => onDelete(task.id)}
                    className="p-2.5 rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer Ad/Info */}
      <div className="mt-8 bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <BookOpen className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium">想要加入 <span className="text-brand-purple">西西AI高效育儿群</span></p>
          <p className="text-xs text-brand-purple font-bold">加微信 LMXD56</p>
        </div>
      </div>
    </motion.div>
  );
}

function CalendarView({ tasks, points }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const days = Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }, (_, i) => i);

  // Calculate monthly stats
  const currentMonthTasks = tasks.filter((t: any) => {
    const d = new Date(t.createdAt);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });
  
  const completedCount = currentMonthTasks.filter((t: any) => t.status === TaskStatus.COMPLETED).length;
  const monthlyPoints = currentMonthTasks.reduce((sum: number, t: any) => t.status === TaskStatus.COMPLETED ? sum + t.points : sum, 0);
  
  const studyDays = Array.from(new Set(currentMonthTasks.map((t: any) => t.createdAt.split('T')[0]))).length;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
            <div className="p-2 rounded-full bg-purple-50 text-brand-purple">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </button>
          <h2 className="text-2xl font-black text-gray-700">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
            <div className="p-2 rounded-full bg-purple-50 text-brand-purple rotate-180">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-gray-300 font-bold text-sm py-2">{d}</div>
          ))}
          {blanks.map(b => <div key={`b-${b}`} />)}
          {days.map(d => {
            const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            const dayTasks = tasks.filter((t: any) => t.createdAt.startsWith(dateStr));
            const dayCompleted = dayTasks.filter((t: any) => t.status === TaskStatus.COMPLETED);
            
            let statusColor = '';
            if (dayTasks.length > 0) {
              if (dayCompleted.length === dayTasks.length) statusColor = 'bg-green-100 text-green-600';
              else if (dayCompleted.length > 0) statusColor = 'bg-yellow-100 text-yellow-600';
              else statusColor = 'bg-orange-100 text-orange-600';
            }

            const isToday = d === new Date().getDate() && 
                            currentDate.getMonth() === new Date().getMonth() &&
                            currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div 
                key={d} 
                className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-lg font-bold transition-all relative ${
                  isToday ? 'ring-2 ring-pink-400 ring-offset-2' : ''
                } ${statusColor || 'text-gray-700 hover:bg-gray-50'}`}
              >
                {d}
                {dayTasks.length > 0 && <div className={`w-1 h-1 rounded-full absolute bottom-2 ${statusColor ? 'bg-current' : 'bg-transparent'}`} />}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center text-xs font-bold pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-400" /> 全部完成</div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> 部分完成</div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-orange-400" /> 有任务</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: CheckCircle2, value: completedCount, label: '本月完成', color: 'text-green-500', bg: 'bg-green-50' },
          { icon: Star, value: monthlyPoints, label: '本月积分', color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { icon: CalendarIcon, value: studyDays, label: '学习天数', color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">{stat.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ManageSubjectsView({ subjects, onAdd, onRemove }: any) {
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📖');
  const [selectedColor, setSelectedColor] = useState('#ffb3ba');

  const icons = ['📖', '🔢', '🌍', '🔬', '🎵', '🎨', '🏃', '🖥️', '🎭', '📏', '🌎', '✏️', '🧪', '🎸', '⚽', '🏊'];
  const colors = ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#c2c2f0', '#ffc2f0', '#d1fffa', '#ffd1dc', '#cc99ff'];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-12"
    >
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-500" /> 我的科目
        </h3>
        <div className="space-y-3">
          {subjects.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm" style={{ backgroundColor: s.color }}>
                  {s.icon}
                </div>
                <span className="font-bold text-gray-700 text-lg">{s.name}</span>
              </div>
              <button 
                onClick={() => onRemove(s.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-brand-purple" /> 添加科目
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-400 block mb-2 uppercase">科目名称</label>
            <input 
              type="text" 
              placeholder="例如：体育、编程..." 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-purple font-medium"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-400 block mb-3 uppercase">选择图标</label>
            <div className="grid grid-cols-6 gap-3">
              {icons.map(icon => (
                <button 
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
                    selectedIcon === icon ? 'bg-brand-purple/10 border-2 border-brand-purple scale-110' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-400 block mb-3 uppercase">选择颜色</label>
            <div className="flex flex-wrap gap-3">
              {colors.map(color => (
                <button 
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color ? 'ring-2 ring-brand-purple ring-offset-2 scale-110 shadow-lg' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm" style={{ backgroundColor: selectedColor }}>
                {selectedIcon}
              </div>
              <span className="font-bold text-gray-700 text-lg">{newName || '科目名称'}</span>
            </div>
            
            <button 
              onClick={() => {
                if (newName) {
                  onAdd(newName, selectedIcon, selectedColor);
                  setNewName('');
                }
              }}
              className="w-full py-4 gradient-purple text-white rounded-2xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-transform"
            >
              添加科目 ✨
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TimerView({ task, subject, onBack, onComplete }: any) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center justify-center pt-8"
    >
      <button 
        onClick={onBack}
        className="self-start mb-12 flex items-center gap-1 text-brand-purple font-bold text-lg"
      >
        <ChevronLeft className="w-6 h-6" /> 返回
      </button>

      <div 
        className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl mb-8 relative"
        style={{ backgroundColor: subject?.color }}
      >
        {subject?.icon}
        <motion.div 
          animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-[2.5rem] border-4 border-white/40" 
        />
      </div>

      <h2 className="text-4xl font-black text-gray-800 mb-2">{task.name}</h2>
      <p className="text-gray-400 font-bold mb-12 flex items-center gap-2">
        {subject?.name} · <span className="text-yellow-500 font-black">+{task.points}</span> 
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      </p>

      <div className="relative w-80 h-80 flex items-center justify-center mb-16">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            cx="160" cy="160" r="140" 
            className="stroke-gray-100 fill-none" 
            strokeWidth="20"
          />
          <motion.circle 
            cx="160" cy="160" r="140" 
            className="stroke-brand-purple fill-none" 
            strokeWidth="20"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: (seconds % 60) / 60 }}
          />
        </svg>
        <div className="bg-white rounded-full w-64 h-64 shadow-2xl flex flex-col items-center justify-center border-8 border-gray-50">
          <div className="text-7xl font-black text-brand-purple leading-none tracking-tighter">
            {formatTime(seconds)}
          </div>
          <div className="text-lg font-bold text-gray-300 mt-2">{Math.floor(seconds / 60)} 分钟</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => {
            setSeconds(0);
            setIsActive(false);
          }}
          className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center active:scale-95 transition-transform"
        >
          <RotateCcw className="w-8 h-8" />
        </button>
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
            isActive ? 'bg-pink-500 shadow-pink-200' : 'gradient-purple shadow-purple-200'
          }`}
        >
          {isActive ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white translate-l-1" />}
        </button>
        <button 
          onClick={onComplete}
          className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-100 active:scale-95 transition-transform"
        >
          <CheckCircle2 className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
}

function AddTaskModal({ isOpen, onClose, subjects, onAdd }: any) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id);
  const [taskName, setTaskName] = useState('');

  const quickTasks = ['背课文', '写日记', '词语听写', '阅读理解', '作文练习'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white w-full max-w-lg rounded-t-[3rem] p-8 shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 p-1 bg-gray-100 rounded-full text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <Plus className="w-7 h-7 text-brand-purple" /> 添加新任务
        </h2>

        <div className="space-y-8">
          <div>
            <label className="text-sm font-bold text-gray-400 block mb-4 uppercase tracking-wider">选择科目</label>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {subjects.map((sub: any) => (
                <button 
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all border-2 ${
                    selectedSubjectId === sub.id 
                      ? 'bg-red-50 border-red-200 text-red-500 shadow-md translate-y-[-2px]' 
                      : 'bg-gray-50 border-transparent text-gray-500'
                  }`}
                >
                  <span className="text-xl">{sub.icon}</span>
                  <span className="font-bold">{sub.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-400 block mb-4 uppercase tracking-wider">快速选择</label>
            <div className="flex flex-wrap gap-2">
              {quickTasks.map(task => (
                <button 
                  key={task}
                  onClick={() => setTaskName(task)}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all border-2 ${
                    taskName === task 
                      ? 'bg-purple-50 border-brand-purple text-brand-purple' 
                      : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  {task}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-400 block mb-3 uppercase tracking-wider">自定义任务名</label>
            <input 
              type="text" 
              placeholder="输入任务名称..." 
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              className="w-full p-5 bg-gray-50 border-2 border-transparent border-gray-100 rounded-3xl focus:outline-none focus:border-brand-purple font-medium text-lg"
            />
          </div>

          <button 
            disabled={!taskName || !selectedSubjectId}
            onClick={() => {
              onAdd(taskName, selectedSubjectId);
              setTaskName('');
            }}
            className="w-full py-5 gradient-purple text-white rounded-3xl font-black text-xl shadow-xl shadow-purple-200 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            添加任务 ✨
          </button>
        </div>
      </motion.div>
    </div>
  );
}
