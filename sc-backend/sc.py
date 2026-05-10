"""SuperCenter 后端启动脚本"""
import sys
import uvicorn

if __name__ == "__main__":
    # 获取端口参数，默认 8000
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
