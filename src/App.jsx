import { CopyOutlined, ReloadOutlined, SmileFilled, SwapLeftOutlined, SwapRightOutlined } from "@ant-design/icons";
import { Button, Card, notification, Switch, Tooltip, Typography } from "antd";
import { shuffle, upperCase } from "lodash";
import React, { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import theme from "react-syntax-highlighter/dist/esm/styles/hljs/darcula";
import { Pagination } from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import "./App.css";
import { useTheme } from "./theme/ThemeProvider";

const { Title } = Typography;

SyntaxHighlighter.registerLanguage("typescript", typescript);

const { Meta } = Card;
const openNotification = ({ placement = "bottom", description = "Code has been copied to clipboard" }) => {
  notification.info({
    message: `Copy to Clipboard`,
    description,
    placement,
    icon: (
      <SmileFilled
        style={{
          color: "#F6B312",
        }}
      />
    ),
  });
};
function App() {
  const { isDark, setThemeDark } = useTheme();

  const [snippets, setSnippets] = useState({});
  const [top10, setTop10] = useState([]);
  const [page, setPage] = useState({ page: 0, limit: 10 });
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/deepakshrma/30-seconds-of-typescript/master/snippets/typescript.json")
      .then((r) => r.json())
      .then((m) => {
        const snippets = Object.values(m).map((snip) => {
          const prefix = snip.prefix.replace("30_", "");
          const name = upperCase(prefix);
          const body = snip.body?.join("\n");
          const description = body.split("*")[3];
          // const description = body.split("*")[3];
          const codeIndex = body.indexOf("export ");
          const code = body.slice(codeIndex);
          return {
            ...snip,
            language: "typescript",
            body,
            code,
            description,
            name,
            prefix,
          };
        });
        setSnippets(snippets);
      });
  }, [page.page]);
  const pageCount = Math.ceil(snippets.length / page.limit);
  useEffect(() => {
    if (page.page <= pageCount) setTop10(snippets.slice(page.page * page.limit, (page.page + 1) * page.limit));
  }, [snippets, page]);

  const onRelaod = () => {
    if (page.page < pageCount - 1) {
      setPage({ ...page, page: page.page + 1 });
    } else {
      setSnippets(shuffle(snippets));
      setPage({ ...page, page: 0 });
    }
  };
  console.log(top10, page.page * page.limit, (page.page + 1) * page.limit);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <br />
      <Switch
        style={{ width: 100, alignSelf: "end" }}
        onChange={() => setThemeDark(!isDark)}
        checkedChildren="Light"
        unCheckedChildren="Dark"
        checked={isDark}
      />
      <Title level={3} style={{ textAlign: "center" }}>
        <SwapLeftOutlined />
        Swipe to Left or Right
        <SwapRightOutlined />
      </Title>
      <ReloadOutlined style={{ fontSize: "40px", color: "#08c" }} onClick={onRelaod} />
      <br />

      <Swiper
        pagination={{
          type: "progressbar",
        }}
        navigation={false}
        modules={[Pagination]}
        className="mySwiper"
      >
        {top10.map(({ prefix, name, description, body, code, language }, i) => {
          return (
            <SwiperSlide key={`snippet__${prefix}`}>
              <Card
                style={{ width: window.innerHeight * 0.8 }}
                // cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                actions={[
                  <CopyToClipboard text={code} onCopy={() => openNotification("top")} key="copy to clipboard">
                    <Tooltip title="copy code">
                      <Button type="primary" icon={<CopyOutlined />}>
                        Copy Code
                      </Button>
                    </Tooltip>
                  </CopyToClipboard>,
                  <CopyToClipboard text={body} onCopy={() => openNotification("top")} key="copy with comment">
                    <Tooltip title="copy with comment">
                      <Button type="primary" icon={<CopyOutlined />}>
                        Copy with comment
                      </Button>
                    </Tooltip>
                  </CopyToClipboard>,
                  // <EditOutlined key="edit" />,
                  // <EllipsisOutlined key="ellipsis" />,
                ]}
              >
                <Meta avatar={`[${language}]`} title={`${i + 1}. ${name}(${prefix})`} description={description} />
                <SyntaxHighlighter language="typescript" style={theme} wrapLines wrapLongLines>
                  {body}
                </SyntaxHighlighter>
              </Card>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default App;
