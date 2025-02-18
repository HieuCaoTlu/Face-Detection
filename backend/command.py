import subprocess

# Định nghĩa các câu lệnh cần chạy
commands = [
    "python manage.py makemigrations api",
    "python manage.py migrate",
    "python manage.py createsuperuser"
]

# Hàm để chạy các câu lệnh
def run_commands(commands):
    for command in commands:
        print(f"Đang chạy: {command}")
        subprocess.run(command, shell=True, check=True)

# Chạy các câu lệnh
if __name__ == "__main__":
    run_commands(commands)
