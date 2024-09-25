CREATE TABLE tb_user(
user_id VARCHAR(10) NOT NULL,
user_pw VARCHAR(10) NOT NULL,
fcm_token VARCHAR(255),
PRIMARY KEY (user_id)
);
CREATE TABLE tb_driver(
driver_id VARCHAR(10) NOT NULL,
driver_pw VARCHAR(10) NOT NULL,
fcm_token VARCHAR(255),
PRIMARY KEY (driver_id)
);
CREATE TABLE td_call(
id INT AUTO_INCREMENT PRIMARY KEY,
user_id VARCHAR(10) NOT NULL,
start_lat VARCHAR(100) NOT NULL,
start_lng VARCHAR(100) NOT NULL,
start_addr VARCHAR(255) NOT NULL,
end_lat VARCHAR(100) NOT NULL,
end_lng VARCHAR(100) NOT NULL,
end_addr VARCHAR(255) NOT NULL,
call_state VARCHAR(10) NOT NULL,
driver_id VARCHAR(10)tb_user
);

INSERT INTO tb_user VALUES('a','1','aaa');

INSERT INTO tb_call VALUES(NULL,'a','0','0','a출발주소','0','0','도착즈소','REQ','');
INSERT INTO tb_call VALUES(NULL,'b','0','0','b출발주소','0','0','b도착즈소','RES','');

ALTER TABLE tb_call
ADD COLUMN requset_tim TIMESTAMP DEFAULT CURRENT_TIMESTAMPtb_driver
