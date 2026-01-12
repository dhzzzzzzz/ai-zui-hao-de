import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Wrench, Users, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [categories, tools, comments] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('ai_tools').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
      ]);

      return {
        categories: categories.count || 0,
        tools: tools.count || 0,
        comments: comments.count || 0,
      };
    },
  });

  const statCards = [
    { title: '分类总数', value: stats?.categories || 0, icon: FolderOpen, color: 'text-blue-500' },
    { title: 'AI工具', value: stats?.tools || 0, icon: Wrench, color: 'text-green-500' },
    { title: '评论数', value: stats?.comments || 0, icon: MessageSquare, color: 'text-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">仪表盘</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">
              欢迎使用AI导航后台管理系统。您可以在左侧菜单中：
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>管理AI工具分类</li>
              <li>添加、编辑或删除AI工具</li>
              <li>查看网站数据统计</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
