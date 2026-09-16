2019/3/1 

	// 每隔5s尝试通过串口或网口发送一次数据，发送失败则尝试建立连接，
	// 如果连接建立成功，那么下个5s时数据将会发送成功，那么，设备连接正常，否则，连接异常。
	private void timer5s_Tick(object sender, EventArgs e)
	{
		bool connSuccess = false;

		if (rdoBtnSocket.Checked)
		{
			if (socket.SendMsg(Protocols.PortCommTest))
			{
				picBoxCommunication.BackgroundImage = Properties.Resources.comm0;
				connSuccess = true;
			}
			else
			{
				socket.ConnectServer();
				picBoxCommunication.BackgroundImage = Properties.Resources.comm1;
			}
		}
		else
		{
			if (serial.Send(Protocols.PortCommTest))
			{
				picBoxCommunication.BackgroundImage = Properties.Resources.comm0;
				connSuccess = true;
			}
			else
			{
				serial.Open();
				picBoxCommunication.BackgroundImage = Properties.Resources.comm1;
			}
		}

		if (connSuccess)
			Data_UpdateEvent();
	}
