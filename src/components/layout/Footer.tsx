import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">AI</span>
              </div>
              <span className="text-xl font-bold">AI导航</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              发现最好用的AI工具，提升您的工作效率
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">工具分类</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/category/ai-chat" className="hover:text-foreground transition-colors">
                  AI对话
                </Link>
              </li>
              <li>
                <Link to="/category/ai-image" className="hover:text-foreground transition-colors">
                  AI绘画
                </Link>
              </li>
              <li>
                <Link to="/category/ai-writing" className="hover:text-foreground transition-colors">
                  AI写作
                </Link>
              </li>
              <li>
                <Link to="/category/ai-video" className="hover:text-foreground transition-colors">
                  AI视频
                </Link>
              </li>
              <li>
                <Link to="/category/ai-audio" className="hover:text-foreground transition-colors">
                  AI音频
                </Link>
              </li>
              <li>
                <Link to="/category/ai-code" className="hover:text-foreground transition-colors">
                  代码生成
                </Link>
              </li>
              <li>
                <Link to="/category/ai-education" className="hover:text-foreground transition-colors">
                  AI教育
                </Link>
              </li>
              <li>
                <Link to="/category/ai-music" className="hover:text-foreground transition-colors">
                  AI音乐
                </Link>
              </li>
              <li>
                <Link to="/category/ai-health" className="hover:text-foreground transition-colors">
                  AI健康
                </Link>
              </li>
              <li>
                <Link to="/category/ai-life" className="hover:text-foreground transition-colors">
                  AI生活
                </Link>
              </li>
              <li>
                <Link to="/category/ai-finance" className="hover:text-foreground transition-colors">
                  AI金融
                </Link>
              </li>
              <li>
                <Link to="/category/ai-business" className="hover:text-foreground transition-colors">
                  AI商业
                </Link>
              </li>
              <li>
                <Link to="/category/ai-design" className="hover:text-foreground transition-colors">
                  AI设计
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">快速链接</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link to="/submit" className="hover:text-foreground transition-colors">
                  提交工具
                </Link>
              </li>
              <li>
                <Link to="/category/ai-chat" className="hover:text-foreground transition-colors">
                  全部分类
                </Link>
              </li>
              <li>
                <a href="mailto:johnsonhaozhongdai@gmail.com" className="hover:text-foreground transition-colors">
                  反馈建议
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">联系方式</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:johnsonhaozhongdai@gmail.com" className="hover:text-foreground transition-colors">
                  johnsonhaozhongdai@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AI导航. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
