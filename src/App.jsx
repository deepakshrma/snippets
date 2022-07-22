import { CopyOutlined, ReloadOutlined, SmileFilled, SwapLeftOutlined, SwapRightOutlined } from "@ant-design/icons";
import { Button, Card, notification, Switch, Tooltip, Typography } from "antd";
import html2canvas from "html2canvas";
import { shuffle, upperCase } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDarkReasonable as theme } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Pagination } from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import "./App.css";
import { fetchSnipets } from "./services/code";
import { useTheme } from "./theme/ThemeProvider";

const { Title } = Typography;

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
  const codeBlock = useRef();
  useEffect(() => {
    fetchSnipets(
      "https://raw.githubusercontent.com/deepakshrma/30-seconds-of-typescript/master/snippets/typescript.json"
    )
      .then((r) => r.json())
      .then((m) => {
        const snippets = Object.values(m).map((snip) => {
          const prefix = snip.prefix.replace("30_", "");
          const name = upperCase(prefix);
          const body = snip.body?.join("\n");
          const description = body.split("*")[3];
          // const description = body.split("*")[3];
          const codeIndex = body.indexOf("export ");
          const comment = body.slice(0, codeIndex);
          const code = body.slice(codeIndex);
          return {
            ...snip,
            language: "typescript",
            body,
            code,
            comment,
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

  const onCopyImage = () => {
    html2canvas(codeBlock.current).then((canvas) => {
      canvas.toBlob((blob) => {
        (async function () {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob,
              }),
            ]);
            openNotification();
          } catch (error) {
            console.error(error);
          }
        })();
      });
    });
  };
  console.log(window.location.pathname);
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
        {top10.map(({ prefix, name, description, body, code, comment, language }, i) => {
          return (
            <SwiperSlide key={`snippet__${prefix}`} ref={codeBlock}>
              <Card
                style={{
                  width: window.innerHeight * 0.8,
                  boxShadow: `rgba(149, 157, 165, 0.2) 0px 8px 24px`,
                }}
                actions={[
                  <Tooltip title="copy code Image to Clipboard">
                    <Button type="primary" icon={<CopyOutlined />} onClick={onCopyImage}>
                      Code Image
                    </Button>
                  </Tooltip>,
                  <CopyToClipboard text={code} onCopy={() => openNotification()} key="copy code to clipboard">
                    <Tooltip title="copy code to clipboard">
                      <Button type="primary" icon={<CopyOutlined />}>
                        Code
                      </Button>
                    </Tooltip>
                  </CopyToClipboard>,
                  <CopyToClipboard text={body} onCopy={() => openNotification()} key="copy with comment to clipboard">
                    <Tooltip title="copy with comment to clipboard">
                      <Button type="primary" icon={<CopyOutlined />}>
                        With Comment
                      </Button>
                    </Tooltip>
                  </CopyToClipboard>,
                ]}
              >
                <Meta avatar={`[${language}]`} title={`${i + 1}. ${name}(${prefix})`} description={description} />
                <SyntaxHighlighter language={language} style={theme} wrapLines wrapLongLines>
                  {comment}
                </SyntaxHighlighter>
                <SyntaxHighlighter language={language} style={theme} wrapLines wrapLongLines>
                  {code}
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
